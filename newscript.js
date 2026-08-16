// next課題: 
// 低確率で発動する演出
// エンタメじゃないルーレットボタン
// 亜種変更スキルにリベンジ

// 効果音、BGMなど
// 英語対応...?

//#region 初期化、データ引き継ぎ

// 宣言w
    let rarity;
    let rouletteRunning = false;
    let atStartScreen = true;
    let kouhaModeIsOn = false;

// weaponDataにcsv読み込み
    let weaponData = [];
    // weapon_list.csvからweaponDataに読み込む関数
    async function loadWeaponData() {

        const response = await fetch("weapon_list.csv");
        const text = await response.text();

        const rows = text.trim().split("\n");

        weaponData = rows.slice(1).map(row => {
            const [rarity, name, image, mainid, sub, special] = row.split(",");
            return { rarity, name, image, mainid, sub, special };
        });

        console.log("CSV読み込み完了");
    }
    // ページを開いたら実行
    window.onload = async function () {
        await loadWeaponData();

        // csv読み込み後に画像読み込み
        weaponData.forEach(weapon => {
        const img = new Image();
        img.src = `images/main/${weapon.image}`;
        });
        // サブスペ手動
        const imagePaths = [
            "images/sub/auto.webp",
            "images/sub/beacon.webp",
            "images/sub/burst.webp",
            "images/sub/curling.webp",
            "images/sub/dart.webp",
            "images/sub/fizzy.webp",
            "images/sub/mine.webp",
            "images/sub/mist.webp",
            "images/sub/sensor.webp",
            "images/sub/splat.webp",
            "images/sub/sprinkler.webp",
            "images/sub/suction.webp",
            "images/sub/torp.webp",
            "images/sub/wall.webp",
            "images/special/booyah.webp",
            "images/special/bubbler.webp",
            "images/special/chumps.webp",
            "images/special/cooler.webp",
            "images/special/crab.webp",
            "images/special/inkjet.webp",
            "images/special/inkstorm.webp",
            "images/special/kraken.webp",
            "images/special/missiles.webp",
            "images/special/screen.webp",
            "images/special/slider.webp",
            "images/special/splashdown.webp",
            "images/special/stamp.webp",
            "images/special/strikes.webp",
            "images/special/vac.webp",
            "images/special/wail.webp",
            "images/special/wavebreaker.webp",
            "images/special/zooka.webp",
            "images/main/sample_empty.png",
            "images/main/sample_hatena.png",
            "images/sub/sample_empty.png",
            "images/sub/sample_hatena.png",
            "images/special/sample_empty.png",
            "images/special/sample_hatena.png"
        ];

        imagePaths.forEach(path => {
            const img = new Image();
            img.src = path;
        });
    };


// エンタメポイント初期化または引き継ぎ
    let entertainmentPoint;

    if (localStorage.getItem("entertainmentPoint") === null) {
        // 初回アクセス
        entertainmentPoint = 15;
        localStorage.setItem("entertainmentPoint", entertainmentPoint);
    } else {
        // 2回目以降
        entertainmentPoint = Number(localStorage.getItem("entertainmentPoint"));
    }
    updatePointDisplay();

// 現在のブキ初期化または引き継ぎ
    let currentWeapon;

    if (localStorage.getItem("currentWeapon") === null) {
        // 初回アクセス
        currentWeapon = {
            name: "---",
            image: "sample_empty.png",
            sub: "sample_empty.png",
            special: "sample_empty.png"
        };
        document.getElementById("resultName").textContent = currentWeapon.name;
        document.getElementById("resultImage").src = "images/main/" + currentWeapon.image;
        document.getElementById("resultImageSub").src = "images/sub/" + currentWeapon.sub;
        document.getElementById("resultImageSpecial").src = "images/special/" + currentWeapon.special;
        
    } else {
        // 2回目以降
        currentWeapon = JSON.parse(localStorage.getItem("currentWeapon"));
        document.getElementById("resultImage").src = "images/main/" + currentWeapon.image;
        document.getElementById("resultImageSub").src = "images/sub/" + currentWeapon.sub;
        document.getElementById("resultImageSpecial").src = "images/special/" + currentWeapon.special;
    }
    updateCurrentWeaponDisplay();

// 三種目があるブキか判定 未来
    //let hasThirdKit;
    //let weaponVariant;

    // ブキデータがあるなら実行
    //if (currentWeapon.name !== "---") {
    //    checkWeaponVariant();
    //}

//#endregion



//#region 「回す」または「確定」ボタン

//　 「回す」ボタンが押されたときに呼ばれる関数
// resultImageContainerを表示し、ルーレット演出が止め、resultScreenに移行するまで担当
async function roll() {
    // 二重クリック防止用変数
    rouletteRunning = true;
    atStartScreen = false;

    // 開始画面を隠す
    document.getElementById("startScreen").style.display = "none";
    // resultScreenを映す
    document.getElementById("resultScreen").style.display = "flex";
    document.getElementById("hideWhileRolling").style.display = "none";

    // ボタン表示変更
    document.getElementById("confirmButton").style.color = "gray";
    document.getElementById("confirmButton").textContent = "抽選中.";

    // whileループの回数と待機時間
    let loopCount = 0;
    let loopTime = 50;

    // ルーレット開始
    // 初速部分
    while (loopCount <= 25) {
        loopCount ++;

        noEntertainmentEffect();
        
        if (loopCount == 10) {
            document.getElementById("confirmButton").textContent = "抽選中..";
        }
        if (loopCount == 20) {
            document.getElementById("confirmButton").textContent = "抽選中...";
        }

        await new Promise(resolve => {
            setTimeout(resolve, loopTime);
        });
    }

    while (loopCount <= 37) {
        loopCount ++;
        loopTime += 10;

        noEntertainmentEffect();

        await new Promise(resolve => {
            setTimeout(resolve, loopTime);
        });
    }

    //　最後のブキをランダム抽選、currentWeapon保存
    if (kouhaModeIsOn) {
        noEntertainmentWeapon();
    } else {
        getRandomWeapon();
    }
    // この時点でストレージ同期
    updateCurrentWeaponDisplay();
    // 結果表示
    showResult();

    document.getElementById("hideWhileRolling").style.display = "flex";
    if (kouhaModeIsOn) {
        document.getElementById("resultRarity").style.display = "none";
    }
    document.getElementById("confirmButton").style.color = "black";
    document.getElementById("confirmButton").textContent = "確定"

    // 亜種変更スキル用にweaponVariant保存、hasThirdKit判定
    // checkWeaponVariant();
    
    // スキル表示更新
    updateAllSkillDisplays();

    rouletteRunning = false;
}

// 「確定」ボタンが押されたときに呼ばれる関数
function confirmRoll() {

    // 二重クリック防止
    if (rouletteRunning) return;

    // エンタメポイントを加算・更新
    if (kouhaModeIsOn) {
        changePoint(5);
    }
    else if (rarity === "5") {
        changePoint(10);
    }
    else if (rarity === "4") {
        changePoint(8);
    }
    else if (rarity === "3") {
        changePoint(7);
    }
    else if (rarity === "2") {
        changePoint(5);
    }
    else {
        changePoint(3);
    }

    // 結果画面を隠す
    document.getElementById("resultScreen").style.display = "none";
    // スタート画面表示、ルーレットリセット
    document.getElementById("startScreen").style.display = "flex";
    atStartScreen = true;
}

// hasThirdKitを判定し、weaponVariantとそのcostを保存する関数 未来
function checkWeaponVariant(){
//     // weaponVariant登録
//     weaponVariant = weaponData.filter(item =>
//         item.mainid === currentWeapon.mainid &&
//         item.name !== currentWeapon.name
//     );
    
//     // hasThirdKit判定
//     if (weaponVariant.length === 2) {
//         hasThirdKit = true;
//     } else {
//         hasThirdKit = false;
//     }

//     // costの値を設定
//     weaponVariant.forEach((weapon) => {
//             if (weapon.rarity === "5") {
//                 weapon.cost = 10;
//             }
//             else if (weapon.rarity === "4") {
//                 weapon.cost = 12;
//             }
//             else if (weapon.rarity === "3") {
//                 weapon.cost = 14;
//             }
//             else if (weapon.rarity === "2") {
//                 weapon.cost = 16;
//             }
//             else {
//                 weapon.cost = 18;
//             }
//         }
//     );
}

// roll後などで亜種スキルの表記更新に使う関数 未来 ->upddateCurrentWeaponDisplayでやる？
function updateWeaponVariant(){
        
}


//#endregion



//#region 処理部分

// ルーレットの表示だけの部分
function rouletteEffect() {
    getRandomWeapon();

    // 名前と画像をcsvから引っ張ってくる
    document.getElementById("resultName").textContent = currentWeapon.name;
    document.getElementById("resultImage").src = "images/main/" + currentWeapon.image;
    document.getElementById("resultImageSub").src = "images/sub/" + currentWeapon.sub;
    document.getElementById("resultImageSpecial").src = "images/special/" + currentWeapon.special;
}

function noEntertainmentEffect() {
    noEntertainmentWeapon();

    // 名前と画像をcsvから引っ張ってくる
    document.getElementById("resultName").textContent = currentWeapon.name;
    document.getElementById("resultImage").src = "images/main/" + currentWeapon.image;
    document.getElementById("resultImageSub").src = "images/sub/" + currentWeapon.sub;
    document.getElementById("resultImageSpecial").src = "images/special/" + currentWeapon.special;
}

// ルーレットの乱数を生成し、currentWeaponに保存する関数
function getRandomWeapon() {

    // ガチャ結果を計算
    const rand = Math.random() * 100;

    if (rand < 40) {
        rarity = "5";      // 40%
    } else if (rand < 65) {
        rarity = "4";       // 25%
    } else if (rand < 85) {
        rarity = "3";        // 20%
    } else if (rand < 95) {
        rarity = "2";        // 10%
    } else {
        rarity = "1";        // 5%
    }

    // 同じレアリティだけ抽出
    const candidates = weaponData.filter(item => item.rarity === rarity);
    
    // 該当するレアリティがない場合のエラーハンドリング
    if (candidates.length === 0) {
        console.error("該当するレアリティがありません:", rarity);
        return;
    }    
    
    // ランダムに1つ選択、currentWeaponに保存（全体で使える）
    currentWeapon = candidates[Math.floor(Math.random() * candidates.length)];

}

// エンタメ度を無視したルーレットの乱数生成の関数
function noEntertainmentWeapon() {
    
    // ランダムに1つ選択、currentWeaponに保存（全体で使える）
    currentWeapon = weaponData[Math.floor(Math.random() * weaponData.length)];

}

// 抽選やスキル使用後などで結果表示を更新する関数（表示on/off自体はしない）
// 事前にcurrentWeaponとrarityを用意
function showResult() {
    // 名前と画像をcsvから引っ張ってくる
    document.getElementById("resultName").textContent = currentWeapon.name;
    document.getElementById("resultImage").src = "images/main/" + currentWeapon.image;
    document.getElementById("resultImageSub").src = "images/sub/" + currentWeapon.sub;
    document.getElementById("resultImageSpecial").src = "images/special/" + currentWeapon.special;

    // レアリティ更新
    if (rarity === "5") {
        document.getElementById("resultRarity").textContent = "エンタメ度: ★★★★★";
    }
    else if (rarity === "4") {
        document.getElementById("resultRarity").textContent = "エンタメ度: ★★★★☆";
    }
    else if (rarity === "3") {
        document.getElementById("resultRarity").textContent = "エンタメ度: ★★★☆☆";
    }
    else if (rarity === "2") {
        document.getElementById("resultRarity").textContent = "エンタメ度: ★★☆☆☆";
    }
    else {
        document.getElementById("resultRarity").textContent = "エンタメ度: ★☆☆☆☆";
    }

}

// currentWeaponDisplayを更新しlocalStorageに保存する関数
function updateCurrentWeaponDisplay() {
    document.getElementById("currentWeaponDisplay").textContent =
        "現在のブキ：" + currentWeapon.name;
        
    localStorage.setItem(
        "currentWeapon",
        JSON.stringify(currentWeapon)
    );
}

// エンタメポイント変更時に数値を入力して呼ぶ関数
function changePoint(amount) {
    //　変数を変更
    entertainmentPoint += amount
    // 表示、localStorageに保存、演出
    updatePointDisplay();
    showPointChangeEffect(amount);
    // スキルボタン表示を更新
    updateAllSkillDisplays();
}

    // ポイント変更時にポイント表示を更新し、localStorageに保存する関数
    function updatePointDisplay() {
        document.getElementById("currentPoint").textContent =
        "エンタメポイント：" + entertainmentPoint;
        localStorage.setItem("entertainmentPoint", entertainmentPoint);
    }

    // ポイント変更時に演出を入れる関数
    function showPointChangeEffect(amount) {

        const text = document.getElementById("pointChange");

        text.textContent = (amount >= 0 ? "+" : "") + amount;

        text.style.color = amount >= 0 ? "limegreen" : "red";

        text.classList.remove("animate");

        // アニメーションをリセット
        void text.offsetWidth;

        text.classList.add("animate");
    }

// 全てのスキルの使用可否の表示を更新する関数
function updateAllSkillDisplays() {

    updateSkillDisplay("skill1", 15);
}

// 各スキルの使用可否の表示を更新する関数
function updateSkillDisplay(skillId, cost) {

    const button = document.getElementById(skillId + "Button");
    const costText = document.getElementById(skillId + "Cost");

    const canUse = entertainmentPoint >= cost;

    button.disabled = !canUse;
    costText.style.color = canUse ? "#555" : "red";
}

//#endregion



//#region スキルボタン、スキル処理

// 再抽選スキルボタンが押された時に呼ばれる関数
function skillReroll() {
    // エンタメポイントを減算
    changePoint(-15)
    // 再抽選
    document.getElementById("hideWhileRolling").style.display = "none";
    roll()
}

// 未来
// function skillChangeWeapon(name) {
    
//     // エンタメポイントを減算
//     entertainmentPoint -= 10;
//     updatePointDisplay();
//     updateAllSkillDisplays();
//     showPointChange(-10);


//     // 名前が一致するブキを取得
//     const result = weaponData.find(weapon => weapon.name === name);

//     if (!result) {
//         console.error("ブキが見つかりません:", name);
//         return;
//     }

//     console.log(result);

//     // 結果表示
//     document.getElementById("resultName").textContent = result.name;
//     document.getElementById("resultImage").src = "images/main/" + result.image;
//     if (rarity === "5") {
//         resultRarity.textContent = "エンタメ度: ★★★★★";
//     }
//     else if (rarity === "4") {
//         resultRarity.textContent = "エンタメ度: ★★★★☆";
//     }
//     else if (rarity === "3") {
//         resultRarity.textContent = "エンタメ度: ★★★☆☆";
//     }
//     else if (rarity === "2") {
//         resultRarity.textContent = "エンタメ度: ★★☆☆☆";
//     }
//     else {
//         resultRarity.textContent = "エンタメ度: ★☆☆☆☆";
//     }

//     // 結果画面表示
//     document.getElementById("resultScreen").style.display = "flex";

//     // 結果保存
//     currentWeapon = result.name;

//     // 亜種変更用に保存
//     const sameMainWeapons = weaponData.filter(item =>
//     item.mainid === result.mainid &&
//     item.name !== result.name
//     );

//     let html = `
//     <h2 class="skillName">亜種変更</h2>
//     `;
    
//     sameMainWeapons.forEach((weapon,index) => {

//         html += `
//             <p class="skillDescription">${weapon.name}に変更します</p>
//             <p class="skillDescription" id="skill2-${index}Cost">
//                 コスト：10 EP
//             </p>
//             <button class="skillButton" id="skill2-${index}Button" onclick="skillChangeWeapon('${weapon.name}')">
//                 使用
//             </button>
//         `;

//     });

//     document.getElementById("skill2Card").innerHTML = html;

//     updateAllSkillDisplays();

//     console.log("乱数:", rand);
//     console.log("レアリティ:", rarity);
//     console.log("候補数:", candidates.length);
//     console.log("結果:", result);

// }

//#endregion



//#region ルーレット回転

// const roulette = document.getElementById("roulette");

// 毎フレームルーレットを回転させ、角度を入手する関数
// function rotateRoulette() {
//     if (rouletteRunning) {
//         rouletteAngle = (rouletteAngle + rouletteSpeed) % 360;
//         roulette.style.transform = `rotate(${rouletteAngle}deg)`;
//     }

//     requestAnimationFrame(rotateRoulette);
// }

// rotateRoulette();

//#endregion



//#region サイドメニュー

// メニューを開くボタンが押されたときに呼ばれる関数
function openMenu() {
    document.getElementById("sideMenu").classList.add("open");
    document.getElementById("overlay").classList.add("show");
}

// メニューを閉じるボタンが押されたときに呼ばれる関数
function closeMenu() {
    document.getElementById("sideMenu").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
}

// データリセットボタンを押したときに呼ばれる関数
function resetData() {

    // 変なタイミングでのクリック防止
    if (!atStartScreen) return;

    if (!confirm("本当にデータをリセットしますか？")) {
        return;
    }

    // 保存データ削除
    localStorage.removeItem("entertainmentPoint");
    localStorage.removeItem("currentWeapon");

    // 初期値に戻す
    entertainmentPoint = 15;
    currentWeapon = {
            name: "---",
            image: "sample_empty.png",
            sub: "sample_empty.png",
            special: "sample_empty.png"
        };
    document.getElementById("resultName").textContent = currentWeapon.name;
    document.getElementById("resultImage").src = "images/main/" + currentWeapon.image;
    document.getElementById("resultImageSub").src = "images/sub/" + currentWeapon.sub;
    document.getElementById("resultImageSpecial").src = "images/special/" + currentWeapon.special;

    // エンタメポイント表示更新、storage保存
    updatePointDisplay();
    // 現在のブキ表示更新、storage保存
    updateCurrentWeaponDisplay();
    // スキル表示更新
    updateAllSkillDisplays();

    // メニューを閉じる
    closeMenu();

}

// データリセットボタンを押したときに呼ばれる関数
function kouhaModeOn() {

    // 変なタイミングでのクリック防止
    if (!atStartScreen) return;

    // 処理更新
    kouhaModeIsOn = true;

    // タイトル更新
    document.getElementById("bigTitle").textContent = "ワクワク☆ただのブキルーレット";

    // ボタン更新
    document.getElementById("kouhaButton").textContent = "オフにする";
    document.getElementById("kouhaButton").onclick = kouhaModeOff;

    // メニューを閉じる
    closeMenu();

}
function kouhaModeOff() {

    // 変なタイミングでのクリック防止
    if (!atStartScreen) return;

    // 処理更新
    kouhaModeIsOn = false;

    // タイトル更新
    document.getElementById("bigTitle").textContent = "ワクワク☆エンタメブキルーレット";

    // ボタン更新
    document.getElementById("kouhaButton").textContent = "オンにする";
    document.getElementById("kouhaButton").onclick = kouhaModeOn;


    // メニューを閉じる
    closeMenu();

}

//#endregion