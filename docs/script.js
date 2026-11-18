/* =========================================
   PENGATURAN KESULITAN WARNA PER TINGKAT
========================================= */

// Semakin kecil angka, semakin sulit ditemukan.
// Semakin besar angka, semakin mudah ditemukan.

const KESULITAN_WARNA = {
    1: {
        1: 20,
        2: 23,
        3: 21,
        4: 19,
        5: 17
    },

    2: {
        1: 19,
        2: 18,
        3: 16,
        4: 14,
        5: 12
    },

    3: {
        1: 15,
        2: 13,
        3: 11,
        4: 9,
        5: 7
    },

    4: {
        1: 12,
        2: 10,
        3: 9,
        4: 8,
        5: 7
    },

    5: {
        1: 8,
        2: 7,
        3: 6,
        4: 4,
        5: 3
    }
};


/* =========================================
   DAFTAR LAYAR
========================================= */

const layar = [
    "menu",
    "pengaturan",
    "game",
    "latihan",
    "hasil"
];


/* =========================================
   WAKTU DAN PENYIMPANAN
========================================= */

const waktuLevel = {
    1: 10,
    2: 10,
    3: 10,
    4: 10,
    5: 10
};

const KUNCI_RIWAYAT = "ketajamanMataRiwayat";
const KUNCI_MUSIK = "ketajamanMataMusik";
const KUNCI_AUDIO = "ketajamanMataAudio";

let musikAktif = localStorage.getItem(KUNCI_MUSIK) !== "off";
let audioAktif = localStorage.getItem(KUNCI_AUDIO) !== "off";

let level = 1;
let tingkat = 1;
let skor = 0;
let waktu = 10;

let timerInterval = null;
let timerTransisi = null;
let timerNotif = null;
let timerLanjut = null;

let warnaBenar = 0;
let sedangTransisi = false;
let pilihanDikunci = false;
let tingkatSudahDijawab = false;

let waktuMulaiGame = 0;
let waktuMulaiTingkat = 0;
let waktuSelesaiGame = 0;

let riwayatSkor = muatRiwayatSkor();
let hasilTersimpan = false;


/* =========================================
   SISTEM POIN DINAMIS
========================================= */

// UBAH POIN SESUAI KEINGINAN

const SISTEM_POIN = {
    0: 100, // 0 detik = 100 poin
    1: 90,  // 1 detik = 90 poin
    2: 80,  // 2 detik = 80 poin
    3: 70,  // 3 detik = 70 poin
    4: 60,  // 4 detik = 60 poin
    5: 50,  // 5 detik = 50 poin
    6: 40,  // 6 detik = 40 poin
    7: 30,  // 7 detik = 30 poin
    8: 20,  // 8 detik = 20 poin
    9: 10,  // 9 detik = 10 poin
    10: 0   // 10 detik = 0 poin
};

const POIN_JIKA_SALAH = 0;
const POIN_WAKTU_HABIS = 0;


// MENGHITUNG POIN BERDASARKAN WAKTU

function hitungPoin(detik) {
    const detikBulat = Math.max(
        0,
        Math.min(
            10,
            Math.ceil(Number(detik) || 0)
        )
    );

    return SISTEM_POIN[detikBulat] ?? 0;
}



/* =========================================
   SISTEM MUSIK DAN AUDIO
========================================= */

function ambilMusikLatar() {
    return document.getElementById("musikLatar");
}


// MEMPERBARUI TOMBOL ON/OFF

function perbaruiTombolAudio() {
    const tombolMusik = document.getElementById("tombolMusik");
    const tombolAudio = document.getElementById("tombolAudio");

    if (tombolMusik) {
        tombolMusik.textContent = musikAktif ? "ON" : "OFF";

        tombolMusik.classList.toggle(
            "nonaktif",
            !musikAktif
        );

        tombolMusik.setAttribute(
            "aria-pressed",
            String(musikAktif)
        );
    }

    if (tombolAudio) {
        tombolAudio.textContent = audioAktif ? "ON" : "OFF";

        tombolAudio.classList.toggle(
            "nonaktif",
            !audioAktif
        );

        tombolAudio.setAttribute(
            "aria-pressed",
            String(audioAktif)
        );
    }
}


// MEMULAI MUSIK LATAR

function mulaiMusikLatar() {
    if (!musikAktif) return;

    const musik = ambilMusikLatar();

    if (!musik) {
        console.warn("Elemen musikLatar tidak ditemukan.");
        return;
    }

    musik.loop = true;

    if (!musik.paused) return;

    const hasilPutar = musik.play();

    if (hasilPutar && typeof hasilPutar.catch === "function") {
        hasilPutar.catch(function(error) {
            console.log(
                "Musik belum dapat diputar:",
                error
            );
        });
    }
}


// MENGHENTIKAN MUSIK LATAR

function hentikanMusikLatar() {
    const musik = ambilMusikLatar();

    if (!musik) return;

    musik.pause();
    musik.currentTime = 0;
}


// TOMBOL MUSIK ON/OFF

function toggleMusik() {
    musikAktif = !musikAktif;

    localStorage.setItem(
        KUNCI_MUSIK,
        musikAktif ? "on" : "off"
    );

    perbaruiTombolAudio();

    if (musikAktif) {
        mulaiMusikLatar();
    } else {
        hentikanMusikLatar();
    }
}


// TOMBOL EFEK SUARA ON/OFF

function toggleAudio() {
    audioAktif = !audioAktif;

    localStorage.setItem(
        KUNCI_AUDIO,
        audioAktif ? "on" : "off"
    );

    perbaruiTombolAudio();
}


/* =========================================
   KESIMPULAN BERDASARKAN SKOR
========================================= */

function dapatkanKesimpulanSkor(nilaiSkor) {
    if (bahasaAktif === "en") {
        if (nilaiSkor >= 1505) {
            return "Your eyes are very observant!";
        } else if (nilaiSkor >= 755) {
            return "Your observation skills are quite good!";
        } else {
            return "Keep improving your attention to detail!";
        }
    }

    if (nilaiSkor >= 1505) {
        return "Mata Anda sangat teliti!";
    } else if (nilaiSkor >= 755) {
        return "Pengamatan Anda cukup baik!";
    } else {
        return "Ayo tingkatkan ketelitian Anda!";
    }
}


/* =========================================
   RIWAYAT SKOR
========================================= */

function muatRiwayatSkor() {
    try {
        const data = localStorage.getItem(KUNCI_RIWAYAT);

        if (!data) return [];

        const riwayat = JSON.parse(data);

        return Array.isArray(riwayat) ? riwayat : [];

    } catch (error) {
        console.error("Riwayat tidak dapat dibaca:", error);
        return [];
    }
}

function simpanRiwayatSkor() {
    try {
        localStorage.setItem(
            KUNCI_RIWAYAT,
            JSON.stringify(riwayatSkor)
        );

        return true;

    } catch (error) {
        console.error("Riwayat tidak dapat disimpan:", error);

        alert(
            "Riwayat gagal disimpan. Periksa penyimpanan browser."
        );

        return false;
    }
}

function formatWaktu(detik) {
    detik = Math.max(
        0,
        Math.floor(Number(detik) || 0)
    );

    return (
        Math.floor(detik / 60) +
        " menit " +
        (detik % 60) +
        " detik"
    );
}

function formatTanggal(tanggal) {
    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================
   EFEK SUARA JAWABAN BENAR DAN SALAH
========================================= */

let audioContext = null;

function putarEfekSuara(jenis) {
    if (!audioAktif) return;

    try {
        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) return;

            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const sekarang = audioContext.currentTime;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        if (jenis === "benar") {
            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
                650,
                sekarang
            );

            oscillator.frequency.setValueAtTime(
                950,
                sekarang + 0.12
            );

        } else {
            oscillator.type = "triangle";

            oscillator.frequency.setValueAtTime(
                280,
                sekarang
            );

            oscillator.frequency.setValueAtTime(
                170,
                sekarang + 0.12
            );
        }

        gain.gain.setValueAtTime(0.001, sekarang);

        gain.gain.exponentialRampToValueAtTime(
            0.2,
            sekarang + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            sekarang + 0.28
        );

        oscillator.start(sekarang);
        oscillator.stop(sekarang + 0.3);

    } catch (error) {
        console.log(
            "Efek suara tidak tersedia:",
            error
        );
    }
}


/* =========================================
   PAPAN SKOR DAN RIWAYAT
========================================= */

function simpanSkorAkhir(menang) {
    if (hasilTersimpan) return;

    hasilTersimpan = true;

    waktuSelesaiGame = Math.max(
        0,
        Math.floor(
            (Date.now() - waktuMulaiGame) / 1000
        )
    );

    riwayatSkor.unshift({
        skor: skor,
        waktu: formatWaktu(waktuSelesaiGame),
        durasiDetik: waktuSelesaiGame,
        status: menang ? "MENANG" : "SELESAI",
        level: level,
        tanggal: new Date().toISOString()
    });

    simpanRiwayatSkor();
    tampilkanPapanSkor();
}

function tampilkanPapanSkor() {
    ["papanSkor", "papanSkorMenu"].forEach(function(id) {
        const papan = document.getElementById(id);

        if (!papan) return;

        papan.innerHTML = "";

        if (riwayatSkor.length === 0) {
            const kosong = document.createElement("p");

            kosong.className = "skor-kosong";
            kosong.textContent =
                "Belum ada riwayat permainan.";

            papan.appendChild(kosong);

            return;
        }

        riwayatSkor.forEach(function(data, indeks) {
            const item = document.createElement("div");

            item.className = "skor-item";

            const judul = document.createElement("strong");

            judul.textContent =
                "Permainan " + (indeks + 1);

            const status = document.createElement("span");

            status.className =
                data.status === "MENANG"
                    ? "status-menang"
                    : "status-kalah";

            status.textContent =
                data.status || "SELESAI";

            const skorItem = document.createElement("p");

            skorItem.textContent =
                "Skor: " + (data.skor ?? 0);

            const kesimpulanItem =
                document.createElement("p");

            kesimpulanItem.textContent =
                (bahasaAktif === "en" ? "Conclusion: " : "Kesimpulan: ") +
                dapatkanKesimpulanSkor(
                    Number(data.skor) || 0
                );

            const levelItem = document.createElement("p");

            levelItem.textContent =
                "Level dicapai: " + (data.level || 1);

            const tanggalItem = document.createElement("p");

            tanggalItem.textContent =
                "Tanggal: " + formatTanggal(data.tanggal);

            item.append(
                judul,
                status,
                skorItem,
                kesimpulanItem,
                levelItem,
                tanggalItem
            );

            papan.appendChild(item);
        });
    });
}


/* =========================================
   RESET RIWAYAT
========================================= */

function resetPapanSkor() {
    if (riwayatSkor.length === 0) {
        alert("Belum ada riwayat yang bisa dihapus.");
        return;
    }

    const modal = document.getElementById(
        "modalKonfirmasiReset"
    );

    if (modal) {
        modal.style.display = "grid";

    } else if (
        confirm(
            "Hapus semua riwayat permainan secara permanen?"
        )
    ) {
        konfirmasiResetPapanSkor();
    }
}

function batalResetPapanSkor() {
    const modal = document.getElementById(
        "modalKonfirmasiReset"
    );

    if (modal) {
        modal.style.display = "none";
    }
}

function konfirmasiResetPapanSkor() {
    const riwayatSebelumnya = riwayatSkor;

    riwayatSkor = [];

    try {
        localStorage.setItem(
            KUNCI_RIWAYAT,
            JSON.stringify([])
        );

        tampilkanPapanSkor();
        batalResetPapanSkor();

        alert(
            "Semua riwayat permainan berhasil dihapus."
        );

    } catch (error) {
        riwayatSkor = riwayatSebelumnya;

        tampilkanPapanSkor();
        batalResetPapanSkor();

        alert(
            "Riwayat gagal dihapus. Silakan coba lagi."
        );

        console.error(error);
    }
}


/* =========================================
   NAVIGASI LAYAR
========================================= */

// SATU FUNGSI UNTUK SEMUA HALAMAN

function tampilkanLayar(id) {
    layar.forEach(function(nama) {
        const elemen = document.getElementById(nama);

        if (elemen) {
            elemen.style.display = "none";
        }
    });

    const halaman = document.getElementById(id);

    if (!halaman) return;

    if (
        id === "menu" ||
        id === "hasil" ||
        id === "pengaturan"
    ) {
        halaman.style.display = "flex";

    } else if (id === "game") {
        halaman.style.display = "block";

    } else {
        halaman.style.display = "";
    }

    if (id === "menu" || id === "hasil") {
        tampilkanPapanSkor();
    }

    if (id === "pengaturan") {
        perbaruiTombolAudio();
    }
}


// MEMBUKA MENU PENGATURAN

function bukaPengaturan() {
    mulaiMusikLatar();
    tampilkanLayar("pengaturan");
}


/* =========================================
   NOTIFIKASI JAWABAN BENAR
========================================= */

function tampilkanNotifBenar(poin) {
    const notifLama = document.querySelector(
        ".answer-notification"
    );

    if (notifLama) notifLama.remove();

    clearTimeout(timerNotif);

    const notif = document.createElement("div");

    notif.className = "answer-notification";

    notif.innerHTML =
        bahasaAktif === "en"
            ? "CORRECT! 🎉<span>+" + poin + " POINTS</span>"
            : "BENAR! 🎉<span>+" + poin + " POIN</span>";

    document.body.appendChild(notif);

    timerNotif = setTimeout(function() {
        notif.remove();
    }, 850);
}


/* =========================================
   MULAI GAME
========================================= */

function mulaiGame() {
    mulaiMusikLatar();

    hentikanTimer();
    hentikanTimerTransisi();

    clearTimeout(timerLanjut);
    clearTimeout(timerNotif);

    const modal = document.getElementById("modalLevel");

    if (modal) {
        modal.style.display = "none";
    }

    const notif = document.querySelector(
        ".answer-notification"
    );

    if (notif) notif.remove();

    sedangTransisi = false;
    pilihanDikunci = false;
    tingkatSudahDijawab = false;

    level = 1;
    tingkat = 1;
    skor = 0;

    waktuMulaiGame = Date.now();
    waktuMulaiTingkat = Date.now();
    waktuSelesaiGame = 0;

    hasilTersimpan = false;

    tampilkanLayar("game");
    mulaiTingkat();
}

function mulaiTingkat() {
    hentikanTimer();

    clearTimeout(timerLanjut);

    sedangTransisi = false;
    pilihanDikunci = false;
    tingkatSudahDijawab = false;

    waktu = waktuLevel[level];

    waktuMulaiTingkat = Date.now();

    document.getElementById("judulLevel").textContent =
        "LEVEL " + level;

    document.getElementById("tingkatText").textContent =
        "Tingkat " + tingkat + " dari 5";

    document.getElementById("timer").textContent =
        waktu;

    document.getElementById("skor").textContent =
        skor;

    document.getElementById("progres").textContent =
        ((level - 1) * 5 + tingkat) + "/25";

    document.getElementById("pesan").textContent =
        "Temukan satu kotak yang warnanya berbeda!";

    buatPapan();
    jalankanTimer();
}


/* =========================================
   MEMBUAT PAPAN WARNA
========================================= */

function buatPapan() {
    const papan = document.getElementById("papan");

    papan.innerHTML = "";

    const jumlahKotak = {
        1: [16, 16, 16, 16, 16],
        2: [20, 20, 20, 20, 20],
        3: [25, 30, 36, 42, 49],
        4: [30, 36, 42, 49, 64],
        5: [36, 42, 49, 56, 64]
    };

    const jumlah =
        jumlahKotak[level][tingkat - 1];

    let kolom;

    if (jumlah <= 16) {
        kolom = 4;
    } else if (jumlah <= 25) {
        kolom = 5;
    } else if (jumlah <= 36) {
        kolom = 6;
    } else if (jumlah <= 49) {
        kolom = 7;
    } else {
        kolom = 8;
    }

    papan.style.gridTemplateColumns =
        `repeat(${kolom}, minmax(0, 1fr))`;

    const hue = Math.floor(Math.random() * 360);

    const saturasi = 70;
    const terang = 50;

    const warnaNormal =
        `hsl(${hue}, ${saturasi}%, ${terang}%)`;

    const beda = KESULITAN_WARNA[level][tingkat];

    const arah =
        Math.random() < 0.5 ? 1 : -1;

    const terangBerbeda = Math.max(
        0,
        Math.min(100, terang + beda * arah)
    );

    const warnaBerbeda =
        `hsl(${hue}, ${saturasi}%, ${terangBerbeda}%)`;

    warnaBenar = Math.floor(
        Math.random() * jumlah
    );

    for (let i = 0; i < jumlah; i++) {
        const kotak = document.createElement("button");

        kotak.type = "button";
        kotak.className = "kotak";

        kotak.style.background =
            i === warnaBenar
                ? warnaBerbeda
                : warnaNormal;

        kotak.setAttribute(
            "aria-label",
            "Kotak warna " + (i + 1)
        );

        kotak.onclick = function() {
            pilihKotak(i);
        };

        papan.appendChild(kotak);
    }
}


/* =========================================
   MEMILIH KOTAK DAN SISTEM POIN
========================================= */

function pilihKotak(indeks) {
    if (
        pilihanDikunci ||
        sedangTransisi ||
        tingkatSudahDijawab ||
        hasilTersimpan
    ) {
        return;
    }

    pilihanDikunci = true;
    tingkatSudahDijawab = true;

    hentikanTimer();

    const durasi = waktuLevel[level];

    const waktuBerjalan =
        (Date.now() - waktuMulaiTingkat) / 1000;

    const sisaDetik = Math.max(
        0,
        Math.ceil(durasi - waktuBerjalan)
    );

    const detikTerpakai = Math.max(
    0,
    durasi - sisaDetik
    );

    if (indeks === warnaBenar) {
        const poin = hitungPoin(detikTerpakai);

        skor += poin;

        putarEfekSuara("benar");
        tampilkanNotifBenar(poin);

        const pesanIndonesia =
            "Benar! Waktu: " +
            detikTerpakai +
            " detik. Kamu mendapat " +
            poin +
            " poin.";

        const pesanInggris =
            "Correct! Time: " +
            detikTerpakai +
            " seconds. You earned " +
            poin +
            " points.";

        document.getElementById("pesan").textContent =
            bahasaAktif === "en"
                ? pesanInggris
                : pesanIndonesia;

    } else {
        putarEfekSuara("salah");

        document.getElementById("pesan").textContent =
            bahasaAktif === "en"
                ? "Wrong answer! You earned 0 points."
                : "Jawaban salah! Kamu mendapat 0 poin.";
    }

    document.getElementById("skor").textContent =
        skor;

    clearTimeout(timerLanjut);

    timerLanjut = setTimeout(
        lanjutTingkatBerikutnya,
        700
    );
}


/* =========================================
   LANJUT TINGKAT DAN LEVEL
========================================= */

function lanjutTingkatBerikutnya() {
    if (hasilTersimpan) return;

    hentikanTimer();

    clearTimeout(timerLanjut);

    pilihanDikunci = true;
    tingkatSudahDijawab = true;

    if (tingkat < 5) {
        tingkat++;

        mulaiTingkat();

        return;
    }

    if (level >= 5) {
        tampilkanHasil(
            true,
            "Kamu berhasil menyelesaikan semua level!"
        );

        return;
    }

    const levelSelesai = level;

    level++;
    tingkat = 1;

    tampilkanModalLevel(levelSelesai);
}

function tampilkanModalLevel(levelSelesai) {
    hentikanTimer();
    hentikanTimerTransisi();

    clearTimeout(timerLanjut);

    sedangTransisi = true;
    pilihanDikunci = true;
    tingkatSudahDijawab = true;

    let sisaWaktu = 3;

    const modal = document.getElementById("modalLevel");

    document.getElementById("judulModalLevel").textContent =
        "LEVEL " + levelSelesai + " SELESAI!";

    document.getElementById("pesanModalLevel").textContent =
        bahasaAktif === "en"
            ? "Amazing! You have completed all 5 stages. " +
              "Are you ready for the next challenge?"
            : "Luar biasa! Kamu berhasil melewati 5 tingkat. " +
              "Siap menghadapi tantangan berikutnya?";

    document.getElementById("angkaLevelBerikutnya").textContent =
        "LEVEL " + level;

    document.getElementById("hitungMundurLevel").textContent =
        sisaWaktu;

    modal.style.display = "grid";

    timerTransisi = setInterval(function() {
        sisaWaktu--;

        const hitungMundur =
            document.getElementById("hitungMundurLevel");

        if (hitungMundur) {
            hitungMundur.textContent =
                Math.max(0, sisaWaktu);
        }

        if (sisaWaktu <= 0) {
            lanjutLevelSekarang();
        }

    }, 1000);
}

function lanjutLevelSekarang() {
    if (!sedangTransisi || hasilTersimpan) return;

    hentikanTimerTransisi();

    const modal = document.getElementById("modalLevel");

    if (modal) {
        modal.style.display = "none";
    }

    sedangTransisi = false;

    mulaiTingkat();
}


/* =========================================
   TIMER 10 DETIK
========================================= */

function jalankanTimer() {
    hentikanTimer();

    document.getElementById("timer").textContent =
        waktu;

    timerInterval = setInterval(function() {
        if (
            sedangTransisi ||
            pilihanDikunci ||
            tingkatSudahDijawab ||
            hasilTersimpan
        ) {
            return;
        }

        const telahLewat =
            (Date.now() - waktuMulaiTingkat) / 1000;

        waktu = Math.max(
            0,
            Math.ceil(waktuLevel[level] - telahLewat)
        );

        document.getElementById("timer").textContent =
            waktu;

        if (telahLewat >= waktuLevel[level]) {
            hentikanTimer();

            pilihanDikunci = true;
            tingkatSudahDijawab = true;

            document.getElementById("pesan").textContent =
                "Waktu habis! Kamu mendapat 0 poin.";

            clearTimeout(timerLanjut);

            timerLanjut = setTimeout(
                lanjutTingkatBerikutnya,
                700
            );
        }

    }, 100);
}

function hentikanTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function hentikanTimerTransisi() {
    if (timerTransisi !== null) {
        clearInterval(timerTransisi);
        timerTransisi = null;
    }
}


/* =========================================
   HASIL PERMAINAN
========================================= */

function tampilkanHasil(menang, pesan) {
    hentikanTimer();
    hentikanTimerTransisi();

    clearTimeout(timerLanjut);
    clearTimeout(timerNotif);

    sedangTransisi = false;
    pilihanDikunci = true;

    const modal = document.getElementById("modalLevel");

    if (modal) {
        modal.style.display = "none";
    }

    simpanSkorAkhir(menang);

    const waktuAkhir =
        document.getElementById("waktuAkhir");

    if (waktuAkhir) {
        waktuAkhir.textContent =
            "Waktu bermain: " +
            formatWaktu(waktuSelesaiGame);
    }

    tampilkanLayar("hasil");

    document.getElementById("ikonHasil").textContent =
        menang ? "🏆" : "⏰";

    document.getElementById("judulHasil").textContent =
        menang ? "SELAMAT!" : "PERMAINAN SELESAI";

    document.getElementById("hasilSkor").textContent =
        skor + " POIN";

    const kesimpulan =
        dapatkanKesimpulanSkor(skor);

    const pesanHasil =
        document.getElementById("pesanHasil");

    pesanHasil.innerHTML = `
        <div style="
            margin-top: 15px;
            padding: 15px;
            border: 1px solid rgba(91, 226, 255, 0.4);
            border-radius: 15px;
            background: rgba(91, 226, 255, 0.08);
            line-height: 1.8;
        ">
            <strong style="
                display: block;
                color: #ffe36e;
                font-size: 1.1em;
                margin-bottom: 8px;
            ">
                📢 KESIMPULAN HASIL PERMAINAN
            </strong>

            <span style="
                display: block;
                color: #5be2ff;
                font-weight: bold;
                font-size: 1.1em;
            ">
                ${kesimpulan}
            </span>

            <small style="
                display: block;
                margin-top: 10px;
            ">
                ${pesan}
            </small>

            <small style="
                display: block;
                margin-top: 8px;
            ">
                Skor permainan tidak dapat memastikan
                ketajaman atau kesehatan mata secara medis.
            </small>
        </div>
    `;

    document.getElementById("tombolUlang").textContent =
        "↻ MAIN LAGI";

    tampilkanPapanSkor();
}


/* =========================================
   KEMBALI KE MENU
========================================= */

function kembaliMenu() {
    mulaiMusikLatar();

    hentikanTimer();
    hentikanTimerTransisi();

    clearTimeout(timerNotif);
    clearTimeout(timerLanjut);

    sedangTransisi = false;
    pilihanDikunci = false;
    tingkatSudahDijawab = false;

    const modal = document.getElementById("modalLevel");

    if (modal) {
        modal.style.display = "none";
    }

    const modalReset =
        document.getElementById("modalKonfirmasiReset");

    if (modalReset) {
        modalReset.style.display = "none";
    }

    const notif = document.querySelector(
        ".answer-notification"
    );

    if (notif) {
        notif.remove();
    }

    tampilkanPapanSkor();

    const waktuAkhir =
        document.getElementById("waktuAkhir");

    if (waktuAkhir) {
        waktuAkhir.textContent = "";
    }

    tampilkanLayar("menu");
}

function konfirmasiMenu() {
    if (
        confirm(
            "Kembali ke menu? Progres permainan akan diulang."
        )
    ) {
        kembaliMenu();
    }
}

function keluarGame() {
    if (
        confirm("Apakah kamu ingin keluar dari permainan?")
    ) {
        kembaliMenu();
    }
}

function lihatPetunjuk() {
    mulaiMusikLatar();

    document.getElementById("modalPetunjuk").style.display =
        "grid";
}

function tutupPetunjuk() {
    document.getElementById("modalPetunjuk").style.display =
        "none";
}


/* =========================================
   MENU TES BUTA WARNA
========================================= */

function bukaLatihan() {
    mulaiMusikLatar();

    hentikanTimer();
    hentikanTimerTransisi();

    clearTimeout(timerLanjut);

    const modal = document.getElementById("modalLevel");

    if (modal) {
        modal.style.display = "none";
    }

    sedangTransisi = false;

    tampilkanLayar("latihan");

    // Langsung membuka tes buta warna
    bukaTesButaWarna();
}

function bukaTesButaWarna() {
    langkahButaWarna = 0;
    jawabanButaWarnaDikunci = false;

    // Sembunyikan pilihan latihan
    document.getElementById("daftarLatihan").style.display =
        "none";

    // Tampilkan halaman tes
    document.getElementById("halamanTesMata").style.display =
        "block";

    document.getElementById("judulTes").textContent =
        "Tes Buta Warna Angka";

   document.getElementById("deskripsiTes").textContent =
    bahasaAktif === "en"
        ? "Look at the image, then enter the number you see."
        : "Perhatikan gambar, lalu pilih angka yang kamu lihat.";

    document.getElementById("hasilTes").textContent = "";

    document.getElementById("tombolTes").style.display =
        "none";

    // Langsung tampilkan soal pertama
    tampilkanSoalButaWarna();
}


/* =========================================
   TES BUTA WARNA ANGKA
========================================= */

const soalButaWarna = [
    
    {
        gambar: "asset/gambar 1.jpeg",
        benar: "8"
    },
    {
        gambar: "asset/gambar 2.jpeg",
        benar: "6"
    },
    {
        gambar: "asset/gambar 3.jpeg",
        benar: "16"
    },
    {
        gambar: "asset/gambar 4.jpeg",
        benar: "26"
    },
    {
        gambar: "asset/gambar 5.jpeg",
        benar: "3"
    },
    {
        gambar: "asset/gambar 6.jpeg",
        benar: "73"
    },
    {
        gambar: "asset/gambar 7.jpeg",
        benar: "tidak ada angka"
    },
    {
        gambar: "asset/gambar 8.jpeg",
        benar: "7"
    },
    {
        gambar: "asset/gambar 9.jpeg",
        benar: "2"
    },
    {
        gambar: "asset/gambar 10.jpeg",
        benar: "tidak ada angka"
    },
    {
        gambar: "asset/gambar 11.jpeg",
        benar: "42"
    },
    {
        gambar: "asset/gambar 12.jpeg",
        benar: "83"
    },
    {
        gambar: "asset/gambar 13.jpeg",
        benar: "97"
    },
    {
        gambar: "asset/gambar 14.jpeg",
        benar: "59"
    },
    {
        gambar: "asset/gambar 15.jpeg",
        benar: "9"
    }
];

let langkahButaWarna = 0;
let jawabanButaWarnaDikunci = false;

   /* =========================================
   TERJEMAHAN JAWABAN TES BUTA WARNA
========================================= */

function teksJawabanButaWarna(nilai) {
    const terjemahan = {
        "tidak ada angka": {
            id: "tidak ada angka",
            en: "no number"
        }
    };

    const kunci = String(nilai).toLowerCase();

    if (terjemahan[kunci]) {
        return terjemahan[kunci][bahasaAktif];
    }

    return String(nilai);
}

/* =========================================
   MENAMPILKAN SOAL BUTA WARNA
========================================= */

function tampilkanSoalButaWarna() {
    const soal = soalButaWarna[langkahButaWarna];

    if (!soal) return;

    jawabanButaWarnaDikunci = false;

    const area = document.getElementById("areaTes");
    const hasil = document.getElementById("hasilTes");
    const tombolLanjut = document.getElementById("tombolTes");

    if (!area || !hasil || !tombolLanjut) {
        console.error("Elemen tes buta warna tidak ditemukan.");
        return;
    }

    hasil.textContent = "";
    tombolLanjut.style.display = "none";

    area.innerHTML = "";

    // NOMOR GAMBAR

    const nomor = document.createElement("p");

    nomor.textContent =
        bahasaAktif === "en"
            ? `Image ${langkahButaWarna + 1} of ${soalButaWarna.length}`
            : `Gambar ${langkahButaWarna + 1} dari ${soalButaWarna.length}`;

    area.appendChild(nomor);

    // GAMBAR TES

    const gambar = document.createElement("img");

    gambar.src = soal.gambar;
    gambar.alt =
        bahasaAktif === "en"
            ? "Color blindness test image"
            : "Gambar tes buta warna angka";

    gambar.onerror = function() {
        console.error("Gambar gagal dimuat:", soal.gambar);

        hasil.textContent =
            bahasaAktif === "en"
                ? "Image not found. Please check the image file location."
                : "Gambar tidak ditemukan. Periksa lokasi file gambar.";
    };

    area.appendChild(gambar);

    // MEMBUAT PILIHAN JAWABAN

    const jawabanBenar = String(soal.benar);

    let opsi = [jawabanBenar];

    const angkaPengalih = [
        "1", "2", "3", "4", "5",
        "6", "7", "8", "9", "12",
        "16", "26", "42", "59", "73",
        "83", "97", "tidak ada angka"
    ].filter(a => a !== jawabanBenar);

    while (opsi.length < 4) {
        const acak = angkaPengalih[
            Math.floor(Math.random() * angkaPengalih.length)
        ];

        if (!opsi.includes(acak)) {
            opsi.push(acak);
        }
    }

    opsi.sort(() => Math.random() - 0.5);

    const pilihan = document.createElement("div");

    pilihan.style.display = "grid";
    pilihan.style.gridTemplateColumns =
        "repeat(2, minmax(0, 1fr))";

    pilihan.style.gap = "10px";
    pilihan.style.maxWidth = "350px";
    pilihan.style.margin = "15px auto";

    const huruf = ["A", "B", "C", "D"];

    opsi.forEach(function(nilai, indeks) {
        const tombolOpsi = document.createElement("button");

        tombolOpsi.type = "button";
        tombolOpsi.className = "test-choice";

        const hurufPilihan = document.createElement("strong");

        hurufPilihan.textContent = huruf[indeks];

        const teksPilihan = document.createElement("span");

        teksPilihan.textContent =
            teksJawabanButaWarna(nilai);

        tombolOpsi.append(
            hurufPilihan,
            teksPilihan
        );

        tombolOpsi.onclick = function() {
            jawabSoalButaWarna(nilai);
        };

        pilihan.appendChild(tombolOpsi);
    });

    area.appendChild(pilihan);
}

/* =========================================
   MEMERIKSA JAWABAN TES BUTA WARNA
========================================= */

function jawabSoalButaWarna(jawaban) {

    if (jawabanButaWarnaDikunci) return;

    jawabanButaWarnaDikunci = true;

    const soal = soalButaWarna[langkahButaWarna];

    const hasil = document.getElementById("hasilTes");
    const tombolLanjut = document.getElementById("tombolTes");

    const pilihan = document.querySelectorAll(".test-choice");

    if (!soal || !hasil || !tombolLanjut) return;

    const benar =
        String(jawaban).toLowerCase() ===
        String(soal.benar).toLowerCase();

    // HASIL JAWABAN

    if (benar) {

        hasil.textContent =
            bahasaAktif === "en"
                ? "Correct answer! 🎉"
                : "Jawaban benar! 🎉";

        hasil.style.color = "#39e879";

    } else {

        hasil.textContent =
            bahasaAktif === "en"
                ? "Incorrect answer! The correct answer is: " +
                  teksJawabanButaWarna(soal.benar)
                : "Jawaban salah! Jawaban yang benar adalah: " +
                  teksJawabanButaWarna(soal.benar);

        hasil.style.color = "#ff5b5b";
    }

    // MENGUNCI PILIHAN

    pilihan.forEach(function(tombol) {

        tombol.disabled = true;

        tombol.style.cursor = "not-allowed";
        tombol.style.opacity = "0.6";

    });

    // MENAMPILKAN TOMBOL LANJUT

    tombolLanjut.style.display = "inline-block";

    if (langkahButaWarna < soalButaWarna.length - 1) {

        tombolLanjut.textContent =
            bahasaAktif === "en"
                ? "NEXT IMAGE →"
                : "GAMBAR BERIKUTNYA →";

    } else {

        tombolLanjut.textContent =
            bahasaAktif === "en"
                ? "FINISH TEST"
                : "SELESAI TES";
    }
}

/* =========================================
   LANJUT KE SOAL BERIKUTNYA
========================================= */

function lanjutSoalButaWarna() {
    if (!jawabanButaWarnaDikunci) return;

    if (langkahButaWarna < soalButaWarna.length - 1) {

        langkahButaWarna++;

        tampilkanSoalButaWarna();

    } else {

        selesaiTesButaWarna();

    }
}


/* =========================================
   SELESAI TES BUTA WARNA
========================================= */

function selesaiTesButaWarna() {

    document.getElementById("areaTes").innerHTML = "";

    document.getElementById("judulTes").textContent =
        bahasaAktif === "en"
            ? "TEST COMPLETED"
            : "TES SELESAI";

    document.getElementById("deskripsiTes").textContent =
        bahasaAktif === "en"
            ? "You have completed all 15 images."
            : "Kamu telah menyelesaikan seluruh 15 gambar.";

    document.getElementById("hasilTes").textContent =
        bahasaAktif === "en"
            ? "Thank you for participating!"
            : "Terima kasih sudah mengikuti tes!";

    document.getElementById("tombolTes").style.display =
        "none";

    // Tombol kembali ke menu latihan
    const tombolKembali = document.createElement("button");

    tombolKembali.textContent =
        bahasaAktif === "en"
            ? "BACK TO MENU"
            : "KEMBALI KE MENU";

    tombolKembali.onclick = function() {

        document.getElementById("halamanTesMata").style.display =
            "none";

        document.getElementById("daftarLatihan").style.display =
            "block";
    };

    document.getElementById("areaTes").appendChild(tombolKembali);
}


/* =========================================
   INISIALISASI PENGATURAN AUDIO
========================================= */

function inisialisasiPengaturanAudio() {
    perbaruiTombolAudio();

    const musik = ambilMusikLatar();

    if (musik) {
        musik.loop = true;

        if (!musikAktif) {
            musik.pause();
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        function() {
            tampilkanPapanSkor();
            inisialisasiPengaturanAudio();
        }
    );

} else {
    tampilkanPapanSkor();
    inisialisasiPengaturanAudio();
}


/* =============================================
   SISTEM DUA BAHASA INDONESIA DAN ENGLISH
============================================= */

const KUNCI_BAHASA = "ketajamanMataBahasa";

let bahasaAktif =
    localStorage.getItem(KUNCI_BAHASA) || "id";

if (!["id", "en"].includes(bahasaAktif)) {
    bahasaAktif = "id";
}

/* =============================================
   KAMUS BAHASA
============================================= */

const kamusBahasa = {
    "Bahasa:": "Language:",

    "UJI FOKUS DAN KETELITIAN":
        "FOCUS AND ACCURACY TEST",

    "Ketajaman": "Visual",
    "Mata": "Acuity",

    "Temukan kotak dengan warna yang berbeda atau uji mata Anda!":
        "Find the box with a different color or test your eyes!",

    "▶ MULAI GAME KOTAK PERBEDAAN WARNA":
        "▶ START COLOR DIFFERENCE GAME",

    "👁 LATIHAN TES BUTA WARNA ANGKA":
        "👁 COLOR BLINDNESS NUMBER TEST",

    "❔ PETUNJUK PERMAINAN":
        "❔ GAME INSTRUCTIONS",

    "⚙️ PENGATURAN":
        "⚙️ SETTINGS",

    "⚙️ Pengaturan":
        "⚙️ Settings",

    "⚙️ PENGATURAN GAME":
        "⚙️ GAME SETTINGS",

    "Atur musik selama permainan.":
        "Adjust music during the game.",

    "Atur suara jawaban benar dan salah.":
        "Adjust correct and incorrect answer sounds.",

    "← KEMBALI KE MENU UTAMA":
        "← BACK TO MAIN MENU",

    "🎵 PENGATURAN MUSIK & AUDIO":
        "🎵 MUSIC & AUDIO SETTINGS",

    "🎵 Musik Latar":
        "🎵 Background Music",

    "🔊 Efek Suara":
        "🔊 Sound Effects",

    "🏆 PAPAN SKOR":
        "🏆 SCOREBOARD",

    "Belum ada riwayat permainan.":
        "No game history yet.",

    "RESET PAPAN SKOR":
        "RESET SCOREBOARD",

    "LATIH KETELITIANMU SEKARANG!":
        "TRAIN YOUR ACCURACY NOW!",

    "← Menu": "← Menu",
    "← Kembali": "← Back",

    "KETAJAMAN MATA": "VISUAL ACUITY",
    "TAHAP PERMAINAN": "GAME STAGE",

    "DETIK": "SECONDS",
    "SKOR": "SCORE",
    "PROGRES": "PROGRESS",

    "Temukan warna yang berbeda!":
        "Find the different color!",

    "Pilih satu kotak yang paling berbeda.":
        "Choose the box that looks the most different.",

    "Temukan satu kotak yang warnanya berbeda!":
        "Find the one box with a different color!",

    "Tes Buta Warna Angka":
        "Color Blindness Number Test",

    "Tebak angka pada plat Ishihara":
        "Guess the number on the Ishihara plate",

    "Perhatikan gambar, lalu pilih angka yang benar yang kamu lihat.":
        "Look at the image, then enter the number you can see.",

    "Angka berapa yang kamu lihat?":
        "What number can you see?",

    "Masukkan angka":
        "Enter the number",

    "Periksa Jawaban":
        "Check Answer",

    "Jawaban benar! 🎉":
        "Correct answer! 🎉",

    "Jawaban belum tepat. Coba perhatikan gambarnya lagi.":
        "Not quite right. Look at the image again.",

    "Masukkan angka terlebih dahulu.":
        "Please enter a number first.",

    "Gambar Berikutnya":
        "Next Image",

    "Selesai": "Finished",

    "HASIL PERMAINAN": "GAME RESULTS",
    "Hebat!": "Great!",
    "Permainan selesai.": "Game completed.",

    "SKOR AKHIR": "FINAL SCORE",

    "↻ MAIN LAGI": "↻ PLAY AGAIN",
    "← MENU UTAMA": "← MAIN MENU",

    "Petunjuk Permainan": "Game Instructions",

    "1. Pilih satu kotak yang warnanya berbeda pada mode game.":
        "1. Choose the box with a different color in game mode.",

    "2. Buka menu Tes Buta Warna Angka untuk memulai tes.":
        "2. Open the Color Blindness Number Test menu to start the test.",

    "3. Masukkan angka yang tepat untuk lanjut ke soal berikutnya.":
        "3. Enter the correct number to continue to the next image.",

    "MENGERTI": "GOT IT",

    "Hapus semua riwayat?": "Delete all history?",

    "Semua riwayat permainan akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.":
        "All game history will be permanently deleted. This action cannot be undone.",

    "TIDAK": "NO",
    "YA, HAPUS": "YES, DELETE",

    "LEVEL SELESAI": "LEVEL COMPLETED",

    "Kamu berhasil menyelesaikan level ini.":
        "You have successfully completed this level.",

    "LEVEL BERIKUTNYA": "NEXT LEVEL",

    "Bersiaplah! Permainan berlanjut otomatis.":
        "Get ready! The game will continue automatically.",

    "LANJUT SEKARANG →": "CONTINUE NOW →",

    "Belum ada riwayat yang bisa dihapus.":
        "There is no history to delete.",

    "Semua riwayat permainan berhasil dihapus.":
        "All game history has been successfully deleted.",

    "Riwayat gagal dihapus. Silakan coba lagi.":
        "Failed to delete history. Please try again.",

    "Riwayat gagal disimpan. Periksa penyimpanan browser.":
        "Failed to save history. Check your browser storage.",

    "Benar!": "Correct!",
    "BENAR! 🎉": "CORRECT! 🎉",

    "Jawaban salah! Kamu mendapat 0 poin.":
        "Wrong answer! You earned 0 points.",

    "Waktu habis! Kamu mendapat 0 poin.":
        "Time is up! You earned 0 points.",

    "MENANG": "WON",
    "SELESAI": "COMPLETED",

    "Mata Anda sangat teliti!":
        "Your eyes are very observant!",

    "Pengamatan Anda cukup baik!":
        "Your observation skills are quite good!",

    "Ayo tingkatkan ketelitian Anda!":
        "Keep improving your attention to detail!",

    "📢 KESIMPULAN HASIL PERMAINAN":
        "📢 GAME RESULT CONCLUSION",

    "Skor permainan tidak dapat memastikan ketajaman atau kesehatan mata secara medis.":
        "Game scores cannot medically determine visual acuity or eye health.",

    "SELAMAT!": "CONGRATULATIONS!",
    "PERMAINAN SELESAI": "GAME COMPLETED",

    "Kembali ke menu? Progres permainan akan diulang.":
        "Return to the menu? Your game progress will be restarted.",

    "Apakah kamu ingin keluar dari permainan?":
        "Do you want to exit the game?",

    "tidak ada angka":
      "no number",

    "Gambar tidak ditemukan. Periksa lokasi file gambar.":
        "Image not found. Please check the image file location.",

    "Terima kasih sudah mengikuti tes!":
        "Thank you for taking the test!",

    "Kamu telah menyelesaikan seluruh 15 gambar.":
        "You have completed all 15 images.",

    "GAMBAR BERIKUTNYA →":
        "NEXT IMAGE →",

    "SELESAI TES":
        "FINISH TEST",

    "KEMBALI KE MENU":
        "BACK TO MENU"
};


/* =============================================
   TERJEMAHAN TEKS DINAMIS
============================================= */

const polaTerjemahan = [
    {
        pola: /^Tingkat (\d+) dari 5$/,
        hasil: m => `Stage ${m[1]} of 5`
    },
    {
        pola: /^LEVEL (\d+) SELESAI!$/,
        hasil: m => `LEVEL ${m[1]} COMPLETED!`
    },
    {
        pola: /^LEVEL (\d+)$/,
        hasil: m => `LEVEL ${m[1]}`
    },
    {
        pola: /^Permainan (\d+)$/,
        hasil: m => `Game ${m[1]}`
    },
    {
        pola: /^\+(\d+) POIN$/,
        hasil: m => `+${m[1]} POINTS`
    },
    {
        pola: /^Benar! Waktu: (\d+) detik\. Kamu mendapat (\d+) poin\.$/,
        hasil: m =>
            `Correct! Time: ${m[1]} seconds. You earned ${m[2]} points.`
    },
    {
        pola: /^Waktu bermain: (.+)$/,
        hasil: m => `Playing time: ${terjemahkanTeks(m[1])}`
    },
    {
        pola: /^(\d+) menit (\d+) detik$/,
        hasil: m => `${m[1]} minutes ${m[2]} seconds`
    },
    {
        pola: /^Gambar (\d+) dari (\d+)$/,
        hasil: m => `Image ${m[1]} of ${m[2]}`
    },
    {
        pola: /^Skor: (\d+)$/,
        hasil: m => `Score: ${m[1]}`
    },
    {
        pola: /^Kesimpulan: (.+)$/,
        hasil: m => `Conclusion: ${terjemahkanTeks(m[1])}`
    },
    {
        pola: /^Level dicapai: (\d+)$/,
        hasil: m => `Level reached: ${m[1]}`
    },
    {
        pola: /^Tanggal: (.+)$/,
        hasil: m => `Date: ${m[1]}`
    }
];


/* =============================================
   FUNGSI PENERJEMAH
============================================= */

function terjemahkanTeks(teks) {
    if (bahasaAktif === "id") return teks;

    const bersih = teks.trim();

    if (kamusBahasa[bersih]) {
        return teks.replace(
            bersih,
            kamusBahasa[bersih]
        );
    }

    for (const item of polaTerjemahan) {
        const cocok = bersih.match(item.pola);

        if (cocok) {
            return teks.replace(
                bersih,
                item.hasil(cocok)
            );
        }
    }

    return teks;
}


/* =============================================
   MENYIMPAN TEKS ASLI
============================================= */

const dataTeksBahasa = new WeakMap();
const dataAtributBahasa = new WeakMap();

function terjemahkanNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const induk = node.parentElement;

    if (!induk) return;

    if ([
        "SCRIPT",
        "STYLE",
        "NOSCRIPT",
        "TEXTAREA",
        "INPUT"
    ].includes(induk.tagName)) return;

    if (!dataTeksBahasa.has(node)) {
        dataTeksBahasa.set(node, {
            asli: node.nodeValue,
            hasil: null
        });
    }

    const data = dataTeksBahasa.get(node);

    if (
        data.hasil !== null &&
        node.nodeValue !== data.hasil
    ) {
        data.asli = node.nodeValue;
        data.hasil = null;
    }

    const hasil = terjemahkanTeks(data.asli);

    if (node.nodeValue !== hasil) {
        data.hasil = hasil;
        node.nodeValue = hasil;
    } else {
        data.hasil = hasil;
    }
}


/* =============================================
   TERJEMAHKAN PLACEHOLDER DAN ATRIBUT
============================================= */

function terjemahkanAtribut(elemen) {
    if (!elemen || elemen.nodeType !== Node.ELEMENT_NODE) return;

    const atribut = [
        "placeholder",
        "title",
        "aria-label"
    ];

    if (!dataAtributBahasa.has(elemen)) {
        dataAtributBahasa.set(elemen, {});
    }

    const data = dataAtributBahasa.get(elemen);

    atribut.forEach(function(nama) {
        if (!elemen.hasAttribute(nama)) return;

        const nilai = elemen.getAttribute(nama);

        if (!data[nama]) {
            data[nama] = {
                asli: nilai,
                hasil: null
            };
        }

        const item = data[nama];

        if (
            item.hasil !== null &&
            nilai !== item.hasil
        ) {
            item.asli = nilai;
            item.hasil = null;
        }

        const hasil = terjemahkanTeks(item.asli);

        if (nilai !== hasil) {
            elemen.setAttribute(nama, hasil);
        }

        item.hasil = hasil;
    });
}


/* =============================================
   TERJEMAHKAN SEMUA ELEMEN
============================================= */

function terjemahkanElemen(elemen) {
    if (!elemen) return;

    if (elemen.nodeType === Node.TEXT_NODE) {
        terjemahkanNode(elemen);
        return;
    }

    if (elemen.nodeType !== Node.ELEMENT_NODE) return;

    terjemahkanAtribut(elemen);

    const walker = document.createTreeWalker(
        elemen,
        NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
        terjemahkanNode(node);
    }
}


/* =============================================
   TERJEMAHKAN SELURUH HALAMAN
============================================= */

function terjemahkanHalaman() {
    document.documentElement.lang =
        bahasaAktif === "en" ? "en" : "id";

    terjemahkanElemen(document.body);

    const pilihan = document.getElementById(
        "pilihanBahasa"
    );

    if (pilihan) {
        pilihan.value = bahasaAktif;
    }

    document.title =
        bahasaAktif === "en"
            ? "Visual Acuity & Color Blindness Test"
            : "Ketajaman Mata & Tes Buta Warna";

    perbaruiTombolAudio();
}


/* =============================================
   GANTI BAHASA
============================================= */

function ubahBahasa(bahasa) {

    if (!["id", "en"].includes(bahasa)) return;

    bahasaAktif = bahasa;

    localStorage.setItem(
        KUNCI_BAHASA,
        bahasaAktif
    );

    terjemahkanHalaman();

    // Perbarui papan skor
    tampilkanPapanSkor();

    // Perbarui tombol audio
    perbaruiTombolAudio();
}

function gantiBahasa(bahasa) {
    ubahBahasa(bahasa);
}

/* =============================================
   TERJEMAHKAN ALERT DAN CONFIRM
============================================= */

const alertAsli = window.alert.bind(window);
const confirmAsli = window.confirm.bind(window);

window.alert = function(pesan) {
    alertAsli(terjemahkanTeks(String(pesan)));
};

window.confirm = function(pesan) {
    return confirmAsli(terjemahkanTeks(String(pesan)));
};


/* =============================================
   PANTAU PERUBAHAN TULISAN JAVASCRIPT
============================================= */

const pengamatBahasa = new MutationObserver(
    function(perubahan) {
        perubahan.forEach(function(item) {

            if (item.type === "characterData") {
                terjemahkanNode(item.target);
            }

            if (item.type === "childList") {
                item.addedNodes.forEach(function(node) {
                    terjemahkanElemen(node);
                });
            }

            if (item.type === "attributes") {
                terjemahkanAtribut(item.target);
            }

        });
    }
);


/* =============================================
   JALANKAN SISTEM BAHASA
============================================= */

function jalankanSistemBahasa() {
    const pilihan = document.getElementById(
        "pilihanBahasa"
    );

    if (pilihan) {
        pilihan.value = bahasaAktif;
    }

    terjemahkanHalaman();
    perbaruiTombolAudio();

    pengamatBahasa.observe(
        document.body,
        {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [
                "placeholder",
                "title",
                "aria-label"
            ]
        }
    );
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        jalankanSistemBahasa
    );
} else {
    jalankanSistemBahasa();
}