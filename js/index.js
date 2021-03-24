const video = document.getElementById('video');

let qvga = { width: { exact: 320 }, height: { exact: 240 } };

let vga = { width: { exact: 640 }, height: { exact: 480 } };

console.log(window.inner)
let resolution = window.innerWidth < 640 ? qvga : vga;

let width = 0;
let height = 0;
let streaming = false;
let vc = null;

const startCamera = () => {
    if (streaming) return;
    navigator.mediaDevices.getUserMedia({ video: resolution, audio: false })
        .then((s) => {
            stream = s;
            video.srcObject = s;
            video.play();
        })
        .catch((e) => {
            console.log('An error occured! ' + e)
        })

    video.addEventListener('canplay', (ev) => {
        if (!streaming) {
            height = video.videoHeight;
            width = video.videoWidth;
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            streaming = true;
            vc = new cv.VideoCapture(video);
        }
        startVideoProcessing();
    }, false);
}

let src = null;
let dstC1 = null;

const startVideoProcessing = () => {
    if (!streaming) { console.warn('Please startup your webcam'); return; }
    // stopVideoProcessing();
    src = new cv.Mat(height, width, cv.CV_8UC4);
    dstC1 = new cv.Mat(height, width, cv.CV_8UC1);
    requestAnimationFrame(processVideo);
}

const stopVideoProcessing = () => {
    if (src != null && !src.isDeleted()) src.delete();
    if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
}

function laplacian(src) {
    var mat = new cv.Mat(height, width, cv.CV_8UC1);
    cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY);
    cv.Laplacian(mat, dstC1, cv.CV_8U, 3, 1, 0, cv.BORDER_DEFAULT);
    mat.delete();
    return dstC1;
}

function canny(src) {
    cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
    cv.Canny(dstC1, dstC1, 150, 300, 3, false);
    return dstC1;
}

const processVideo = () => {
    vc.read(src);
    cv.putText(src, 'Put your ID Card here', new cv.Point((width / 4) + 30, height / 5), 5, 1.0, [255, 0, 0, 255], 3);
    cv.rectangle(
        src,
        new cv.Point(width / 4, height / 4),
        new cv.Point(width - (width / 5), height - (height / 3)),
        [0, 255, 0, 255],
        10
    );
    cv.imshow("canvasOutput", src);
    vc.read(src);
    result2 = canny(src);
    cv.imshow("canvasOutput2", result2);
    requestAnimationFrame(processVideo);
}

const opencvIsReady = () => {
    console.log('OpenCV.js is ready');
    if (!featuresReady) {
        console.log('Requred features are not ready.');
        return;
    }
    startCamera();
}