const STORAGE_KEY = "clearLevelData";
const LEVEL_PREFIX = "level";
const BLOCK = {
    start: 0,
    empty: 1,
    filled: 2,
    blocked: 9,
};

const GAME_IMAGE_SRC = {
    block0: "images/block_num0.png",
    block1: "images/block_num1.png",
    block2: "images/block_num2.png",
    block9: "images/block_num9.png",
};

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const app = document.querySelector(".app");
const loadingCover = document.querySelector("#loadingCover");
const preloadBox = document.querySelector("#preload");
const welcomeAudio = document.querySelector("#welcomeAudio");
const audioIcon = document.querySelector("#audio img");

let audioPlay = false;
let map;
let nowLevel;

function levelKey(level) {
    return `${LEVEL_PREFIX}${level}`;
}

function cloneMap(level) {
    const source = allMap[levelKey(level)];
    return source == null ? null : source.map(row => [...row]);
}

function waitForDomImage(img) {
    if (img.complete) return Promise.resolve();

    return new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
    });
}

function loadImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img), { once: true });
        img.addEventListener("error", () => resolve(null), { once: true });
        img.src = src;

        if (img.complete) resolve(img);
    });
}

function hideLoading() {
    loadingCover.classList.add("hide");
    preloadBox.classList.add("hide");
}

function audioOn() {
    if (audioPlay) {
        welcomeAudio.pause();
        audioIcon.src = "images/audio-play.png";
        audioPlay = false;
        return;
    }

    const playPromise = welcomeAudio.play();
    if (playPromise != null) {
        playPromise.catch(() => {
            audioIcon.src = "images/audio-play.png";
            audioPlay = false;
        });
    }

    audioIcon.src = "images/audio-pause.png";
    audioPlay = true;
}

function intoWelcome() {
    document.querySelector("#welcome").classList.add("hide");
}

function installPullDownBlocker() {
    let isWindowTop = false;
    let lastTouchY = 0;

    document.addEventListener("touchstart", e => {
        if (e.touches.length !== 1) return;

        lastTouchY = e.touches[0].clientY;
        isWindowTop = window.pageYOffset === 0;
    }, { passive: true });

    document.addEventListener("touchmove", e => {
        if (e.touches.length !== 1) return;

        const touchY = e.touches[0].clientY;
        const touchYMove = touchY - lastTouchY;
        lastTouchY = touchY;

        if (isWindowTop && touchYMove > 0) {
            isWindowTop = false;
            e.preventDefault();
        }
    }, { passive: false });
}

const allMap = {
    level1: [
        [1, 1, 1, 1, 9],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [9, 1, 1, 1, 1],
    ],
    level2: [
        [9, 1, 1, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 9],
    ],
    level3: [
        [1, 1, 1, 1, 1],
        [1, 0, 9, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 9, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ],
    level4: [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 9, 1],
        [1, 1, 0, 1, 1],
        [9, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ],
    level5: [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 9, 1],
        [1, 9, 1, 1, 1],
        [1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ],
    level6: [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 0, 1],
        [1, 1, 1, 9, 1],
        [1, 1, 1, 9, 1],
        [1, 1, 1, 1, 1],
    ],
    level7: [
        [1, 1, 1, 1, 1],
        [1, 0, 1, 9, 1],
        [1, 9, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ],
    level8: [
        [1, 1, 1, 1, 1],
        [1, 1, 0, 9, 1],
        [1, 1, 1, 1, 1],
        [9, 1, 1, 1, 1],
        [9, 1, 1, 1, 1],
    ],
    level9: [
        [1, 1, 9, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 9, 1, 1],
    ],
    level10: [
        [1, 1, 1, 1, 9],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 9, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ],
    level11: [
        [9, 9, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 9, 9, 1, 0, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
    ],
    level12: [
        [9, 1, 1, 1, 1, 9],
        [9, 1, 1, 9, 1, 1],
        [1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 9, 9],
        [1, 1, 1, 1, 1, 9],
        [1, 1, 1, 1, 1, 9],
    ],
    level13: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 9, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 9, 0, 1, 1, 1],
        [1, 1, 9, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 9, 1, 1],
    ],
};

const totalLevel = Object.keys(allMap).length;

function createDefaultLevelSaveData() {
    const data = {};

    for (let i = 1; i <= totalLevel; i++) {
        data[levelKey(i)] = {
            time: "99",
            canPlay: i === 1 ? "yes" : "no",
            clear: "no",
        };
    }

    return data;
}

function normalizeLevelSaveData(savedData) {
    const data = createDefaultLevelSaveData();

    if (savedData == null || typeof savedData !== "object") return data;

    for (let i = 1; i <= totalLevel; i++) {
        const key = levelKey(i);
        data[key] = {
            ...data[key],
            ...savedData[key],
        };
    }

    return data;
}

let levelSaveData = createDefaultLevelSaveData();

const mapGame = {
    clockTime: 0,
    maxClockTime: 61,
    count: null,
    clock: document.querySelector("#clock"),
    playerLevelProcess: document.querySelector("#playerLevelProcess"),
    defaultMaxCanvasSize: 500,
    realCanvasSize: null,
    blockSize: null,
    nowBlockRow: null,
    nowBlockColumn: null,
    nowMouseX: null,
    nowMouseY: null,
    stepData: [],
    imageCache: {},
    eventsBound: false,
    isPlaying: false,

    preloadImages() {
        const tasks = Object.entries(GAME_IMAGE_SRC).map(([key, src]) => {
            return loadImage(src).then(img => {
                this.imageCache[key] = img;
            });
        });

        return Promise.all(tasks);
    },

    getImageKey(status) {
        switch (status) {
            case BLOCK.start:
                return "block0";
            case BLOCK.filled:
                return "block2";
            case BLOCK.blocked:
                return "block9";
            default:
                return "block1";
        }
    },

    isAdjacent(row, column) {
        return Math.abs(row - this.nowBlockRow) + Math.abs(column - this.nowBlockColumn) === 1;
    },

    isPreviousStep(row, column) {
        if (this.stepData.length < 2) return false;

        const previousStep = this.stepData[this.stepData.length - 2];
        return previousStep.row === row && previousStep.column === column;
    },

    setCurrentBlock(row, column, mouseX = 0, mouseY = 0, shouldSaveStep = true) {
        this.nowBlockRow = row;
        this.nowBlockColumn = column;
        this.nowMouseX = mouseX;
        this.nowMouseY = mouseY;

        if (shouldSaveStep) {
            this.stepData.push({ row, column });
        }
    },

    findStartBlock() {
        for (let column = 0; column < map.length; column++) {
            for (let row = 0; row < map[column].length; row++) {
                if (map[column][row] === BLOCK.start) {
                    return { row, column };
                }
            }
        }

        return null;
    },

    resetPathFromStart() {
        const startBlock = this.findStartBlock();
        this.stepData = [];

        if (startBlock == null) return;

        this.setCurrentBlock(startBlock.row, startBlock.column);
    },

    countRemainingBlocks() {
        let remaining = 0;

        for (let column = 0; column < map.length; column++) {
            for (let row = 0; row < map[column].length; row++) {
                if (map[column][row] === BLOCK.empty) {
                    remaining++;
                }
            }
        }

        return remaining;
    },

    resetFilledBlocks() {
        for (let column = 0; column < map.length; column++) {
            for (let row = 0; row < map[column].length; row++) {
                if (map[column][row] === BLOCK.filled) {
                    map[column][row] = BLOCK.empty;
                }
            }
        }

        this.resetPathFromStart();
        this.reFlashMap();
    },

    completeLevel() {
        alert("過關");

        this.stopClock();
        this.isPlaying = false;
        this.playerLevelProcess.classList.remove("hide");
        this.saveLocalStorage(nowLevel, this.clockTime);
        nowLevel++;
        loadData.init();
    },

    finishAttempt() {
        if (!this.isPlaying) return;

        if (this.countRemainingBlocks() === 0) {
            this.completeLevel();
            return;
        }

        this.resetFilledBlocks();
    },

    saveLocalStorage(level, time) {
        const currentKey = levelKey(level);
        const nextKey = levelKey(level + 1);

        if (levelSaveData[currentKey] == null) return;

        levelSaveData[currentKey].clear = "yes";
        levelSaveData[currentKey].time = String(time);
        levelSaveData[currentKey].canPlay = "yes";

        if (levelSaveData[nextKey] != null) {
            levelSaveData[nextKey].canPlay = "yes";
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(levelSaveData));
    },

    getPointerPosition(e) {
        const pointer = e.touches && e.touches.length > 0 ? e.touches[0] : e;
        const rect = canvas.getBoundingClientRect();

        return {
            x: pointer.clientX - rect.left,
            y: pointer.clientY - rect.top,
        };
    },

    getCellFromEvent(e) {
        const position = this.getPointerPosition(e);

        if (
            position.x < 0 ||
            position.y < 0 ||
            position.x >= this.realCanvasSize ||
            position.y >= this.realCanvasSize
        ) {
            return null;
        }

        return {
            row: Math.floor(position.x / this.blockSize),
            column: Math.floor(position.y / this.blockSize),
            mouseX: position.x,
            mouseY: position.y,
        };
    },

    handleMove(e) {
        if (!this.isPlaying || map == null) return;

        e.preventDefault();

        const cell = this.getCellFromEvent(e);
        if (cell == null || map[cell.column] == null) return;

        const targetStatus = map[cell.column][cell.row];

        if (targetStatus === BLOCK.empty && this.isAdjacent(cell.row, cell.column)) {
            map[cell.column][cell.row] = BLOCK.filled;
            this.setCurrentBlock(cell.row, cell.column, cell.mouseX, cell.mouseY);
            this.reFlashMap();
            return;
        }

        if (targetStatus === BLOCK.start && this.stepData.length === 2) {
            const lastStep = this.stepData[1];
            map[lastStep.column][lastStep.row] = BLOCK.empty;
            this.stepData = [this.stepData[0]];
            this.setCurrentBlock(cell.row, cell.column, cell.mouseX, cell.mouseY, false);
            this.reFlashMap();
            return;
        }

        if (targetStatus === BLOCK.filled && this.isPreviousStep(cell.row, cell.column)) {
            const currentStep = this.stepData.pop();
            map[currentStep.column][currentStep.row] = BLOCK.empty;
            this.setCurrentBlock(cell.row, cell.column, cell.mouseX, cell.mouseY, false);
            this.reFlashMap();
        }
    },

    bindCanvasEvents() {
        if (this.eventsBound) return;

        canvas.addEventListener("mousemove", e => this.handleMove(e));
        canvas.addEventListener("touchmove", e => this.handleMove(e), { passive: false });

        ["mouseleave", "mouseup", "touchend"].forEach(eventName => {
            canvas.addEventListener(eventName, () => this.finishAttempt());
        });

        window.addEventListener("resize", () => {
            if (map == null) return;

            this.canvasSizeSet();
            this.reFlashMap();
        });

        this.eventsBound = true;
    },

    drawBlock(status, row, column) {
        const block = this.imageCache[this.getImageKey(status)];
        const x = row * this.blockSize;
        const y = column * this.blockSize;

        if (block != null && block.complete && block.naturalWidth > 0) {
            ctx.drawImage(block, x, y, this.blockSize, this.blockSize);
            return;
        }

        ctx.fillStyle = status === BLOCK.blocked ? "#3c1e78" : "#ffffff";
        ctx.fillRect(x, y, this.blockSize, this.blockSize);
    },

    clearMapBG() {
        ctx.fillStyle = "#5a2ccd";
        ctx.fillRect(0, 0, this.realCanvasSize, this.realCanvasSize);
    },

    drawMap() {
        if (map == null) return;

        this.blockSize = this.realCanvasSize / map[0].length;
        this.clearMapBG();

        for (let column = 0; column < map.length; column++) {
            for (let row = 0; row < map[column].length; row++) {
                this.drawBlock(map[column][row], row, column);
            }
        }
    },

    reFlashMap() {
        this.drawMap();
    },

    canvasSizeSet() {
        this.realCanvasSize = Math.min(app.clientWidth, this.defaultMaxCanvasSize);
        canvas.width = this.realCanvasSize;
        canvas.height = this.realCanvasSize;
    },

    stopClock() {
        clearTimeout(this.count);
        this.count = null;
    },

    clockStart() {
        this.stopClock();
        this.clockTick();
    },

    clockTick() {
        if (this.clockTime > 0) {
            this.clockTime--;
            this.clock.textContent = this.clockTime;
            this.count = setTimeout(() => this.clockTick(), 1000);
            return;
        }

        this.stopClock();
        this.isPlaying = false;
        this.playerLevelProcess.classList.remove("hide");
        alert("time out");
    },

    init(userChance) {
        this.stopClock();

        if (userChance !== undefined) {
            nowLevel = userChance;
        }

        if (!loadData.switchMap()) return;

        this.clockTime = this.maxClockTime;
        this.isPlaying = true;
        this.canvasSizeSet();
        this.resetPathFromStart();
        this.drawMap();
        this.bindCanvasEvents();
        this.playerLevelProcess.classList.add("hide");
        this.clockStart();
    },
};

const loadData = {
    levelSelect: document.querySelector("#levelSelect"),
    starImgSrc: {
        star0: "images/star-0.png",
        star1: "images/star-1.png",
        star2: "images/star-2.png",
        star3: "images/star-3.png",
    },
    buttonImgSrc: {
        clear: "images/button-clear.png",
        play: "images/button-play.png",
        no: "images/button-no.png",
    },

    getStar(level) {
        if (level.clear !== "yes") return 0;

        const time = parseInt(level.time, 10);
        if (!Number.isFinite(time)) return 0;

        if (time >= 45) return 3;
        if (time > 25) return 2;
        return 1;
    },

    setStar(ele, level) {
        const img = ele.querySelector(".levelSelect_star img");
        img.src = this.starImgSrc[`star${this.getStar(level)}`];
    },

    setClearBtn(ele, level, idx) {
        const img = ele.querySelector(".levelSelect_button a img");
        const a = ele.querySelector(".levelSelect_button a");
        const canPlay = level.canPlay === "yes";
        const isClear = level.clear === "yes";

        a.dataset.level = idx;
        a.dataset.canPlay = canPlay ? "yes" : "no";
        a.setAttribute("aria-label", `第 ${idx} 關${canPlay ? "" : "，尚未解鎖"}`);

        if (canPlay && isClear) {
            img.src = this.buttonImgSrc.clear;
            return;
        }

        if (canPlay) {
            img.src = this.buttonImgSrc.play;
            return;
        }

        img.src = this.buttonImgSrc.no;
    },

    linkLevelButton() {
        this.levelSelect.querySelectorAll("li").forEach((ele, idx) => {
            const level = idx + 1;
            const data = levelSaveData[levelKey(level)];

            this.setStar(ele, data);
            this.setClearBtn(ele, data, level);
        });
    },

    switchMap(level = nowLevel) {
        const nextMap = cloneMap(level);
        if (nextMap == null) {
            alert("全部結束");
            return false;
        }

        map = nextMap;
        return true;
    },

    checkLevel() {
        let firstUnclearLevel = null;

        for (let i = 1; i <= totalLevel; i++) {
            if (levelSaveData[levelKey(i)].clear !== "yes") {
                firstUnclearLevel = i;
                break;
            }
        }

        if (firstUnclearLevel == null) {
            alert("你已經全部通關");
            nowLevel = 1;
        } else {
            nowLevel = firstUnclearLevel;
        }

        this.linkLevelButton();
        this.switchMap();
    },

    init() {
        let savedData = null;

        try {
            savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (error) {
            savedData = null;
        }

        levelSaveData = normalizeLevelSaveData(savedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(levelSaveData));
        this.checkLevel();
    },
};

function clearData() {
    localStorage.clear();
    window.location.reload();
}

document.querySelector("#startGame").addEventListener("click", () => {
    intoWelcome();
});

document.querySelector("#audioButton").addEventListener("click", () => {
    audioOn();
});

document.querySelector("#clearDataButton").addEventListener("click", () => {
    clearData();
});

loadData.levelSelect.addEventListener("click", e => {
    const levelButton = e.target.closest(".levelSelect_button a");
    if (levelButton == null) return;

    e.preventDefault();
    if (levelButton.dataset.canPlay !== "yes") return;

    mapGame.init(parseInt(levelButton.dataset.level, 10));
});

installPullDownBlocker();
loadData.init();

Promise.all([
    ...Array.from(document.images).map(waitForDomImage),
    mapGame.preloadImages(),
]).then(hideLoading);
