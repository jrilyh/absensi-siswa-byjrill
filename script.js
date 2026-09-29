/* =====================================
   EMAILJS
===================================== */

const SERVICE_ID = "service_0j76nj5";

const TEMPLATE_ID = "template_u46s6wk";

const PUBLIC_KEY = "h93S9FC0EV8u-rJcB";


emailjs.init({
    publicKey: PUBLIC_KEY
});


/* =====================================
   ELEMENT
===================================== */

const namaInput =
    document.getElementById("nama");

const kelasInput =
    document.getElementById("kelas");

const btnKirim =
    document.getElementById("btnKirim");

const pesan =
    document.getElementById("pesan");

const tanggalElement =
    document.getElementById("tanggal");

const jamElement =
    document.getElementById("jam");

const daftarAbsensi =
    document.getElementById("daftarAbsensi");

const jumlahElement =
    document.getElementById("jumlah");

const btnHapus =
    document.getElementById("btnHapus");


/* =====================================
   DATA
===================================== */

let dataAbsensi =
    JSON.parse(
        localStorage.getItem("dataAbsensi")
    ) || [];


/* =====================================
   WAKTU WIB
===================================== */

function getWaktuWIB() {

    const sekarang = new Date();


    const tanggal =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                timeZone: "Asia/Jakarta",
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        ).format(sekarang);


    const waktu =
        new Intl.DateTimeFormat(
            "id-ID",
            {
                timeZone: "Asia/Jakarta",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        ).format(sekarang);


    return {
        tanggal,
        waktu
    };

}


/* =====================================
   JAM
===================================== */

function updateJam() {

    const waktu =
        getWaktuWIB();


    tanggalElement.textContent =
        waktu.tanggal;


    jamElement.textContent =
        waktu.waktu;

}


updateJam();


setInterval(
    updateJam,
    1000
);


/* =====================================
   SIMPAN
===================================== */

function simpanData() {

    localStorage.setItem(
        "dataAbsensi",
        JSON.stringify(dataAbsensi)
    );

}


/* =====================================
   ESCAPE HTML
===================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


/* =====================================
   STATUS EMOJI
===================================== */

function getStatusEmoji(status) {

    const emoji = {

        HADIR: "😊",

        SAKIT: "🤒",

        IZIN: "📝",

        ALPA: "❌"

    };


    return emoji[status] || "📋";

}


/* =====================================
   TAMPILKAN ABSENSI
===================================== */

function tampilkanAbsensi() {


    jumlahElement.textContent =
        dataAbsensi.length;


    if (dataAbsensi.length === 0) {

        daftarAbsensi.innerHTML = `

            <div class="empty">

                <div>
                    📝
                </div>

                <p>
                    Belum ada siswa yang absen
                </p>

            </div>

        `;

        return;

    }


    daftarAbsensi.innerHTML = "";


    dataAbsensi.forEach(
        function (siswa) {


            const item =
                document.createElement("div");


            item.className =
                "student";


            const huruf =
                siswa.nama
                    .trim()
                    .charAt(0)
                    .toUpperCase();


            const kelas =
                siswa.kelas || "-";


            const status =
                siswa.status || "HADIR";


            item.innerHTML = `

                <div class="avatar">
                    ${escapeHTML(huruf)}
                </div>


                <div class="student-info">

                    <strong>
                        ${escapeHTML(siswa.nama)}
                    </strong>

                    <small>
                        🏫 ${escapeHTML(kelas)}
                        •
                        ${escapeHTML(siswa.tanggal)}
                        •
                        ${escapeHTML(siswa.waktu)}
                        WIB
                    </small>

                </div>


                <div class="status">

                    ${getStatusEmoji(status)}
                    ${escapeHTML(status)}

                </div>

            `;


            daftarAbsensi.appendChild(item);

        }
    );

}


/* =====================================
   PESAN
===================================== */

function tampilkanPesan(
    teks,
    tipe
) {

    pesan.textContent =
        teks;


    pesan.className =
        tipe;


    setTimeout(
        function () {

            pesan.textContent =
                "";

            pesan.className =
                "";

        },
        4000
    );

}


/* =====================================
   CONFETTI
===================================== */

function tampilkanConfetti() {


    const warna = [

        "#ff4757",
        "#ffa502",
        "#2ed573",
        "#1e90ff",
        "#a55eea",
        "#ff6b81",
        "#00d2d3"

    ];


    for (
        let i = 0;
        i < 120;
        i++
    ) {


        const kertas =
            document.createElement("div");


        kertas.className =
            "confetti";


        kertas.style.left =
            Math.random() * 100 + "vw";


        kertas.style.background =
            warna[
                Math.floor(
                    Math.random() *
                    warna.length
                )
            ];


        kertas.style.animationDuration =
            (Math.random() * 2 + 3) + "s";


        kertas.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        document.body.appendChild(
            kertas
        );


        setTimeout(
            function () {

                kertas.remove();

            },
            5000
        );

    }

}


/* =====================================
   KIRIM ABSENSI
===================================== */

btnKirim.addEventListener(
    "click",
    async function () {


        const nama =
            namaInput.value.trim();


        const kelas =
            kelasInput.value.trim();


        const statusElement =
            document.querySelector(
                'input[name="status"]:checked'
            );


        const status =
            statusElement
                ? statusElement.value
                : "";


        /* VALIDASI NAMA */

        if (nama === "") {

            tampilkanPesan(
                "⚠️ Masukkan nama kamu terlebih dahulu!",
                "error"
            );

            namaInput.focus();

            return;

        }


        /* VALIDASI KELAS */

        if (kelas === "") {

            tampilkanPesan(
                "⚠️ Masukkan kelas kamu terlebih dahulu!",
                "error"
            );

            kelasInput.focus();

            return;

        }


        /* VALIDASI STATUS */

        if (status === "") {

            tampilkanPesan(
                "⚠️ Pilih status kehadiran!",
                "error"
            );

            return;

        }


        const waktu =
            getWaktuWIB();


        /* =================================
           CEK DUPLIKAT
        ================================= */

        const sudahAda =
            dataAbsensi.some(
                function (siswa) {

                    return (

                        siswa.nama
                            .toLowerCase() ===
                        nama.toLowerCase()

                        &&

                        siswa.tanggal ===
                        waktu.tanggal

                    );

                }
            );


        if (sudahAda) {

            tampilkanPesan(
                "⚠️ Nama tersebut sudah absen hari ini.",
                "error"
            );

            return;

        }


        /* =================================
           BUTTON LOADING
        ================================= */

        btnKirim.disabled =
            true;


        btnKirim.innerHTML =
            "⏳ Mengirim...";


        try {


            /* =================================
               DATA EMAIL
            ================================= */

            const templateParams = {

                nama: nama,

                kelas: kelas,

                status: status,

                tanggal:
                    waktu.tanggal,

                waktu:
                    waktu.waktu

            };


            /* =================================
               KIRIM EMAIL
            ================================= */

            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams
            );


            /* =================================
               SIMPAN DATA
            ================================= */

            const dataBaru = {

                nama: nama,

                kelas: kelas,

                status: status,

                tanggal:
                    waktu.tanggal,

                waktu:
                    waktu.waktu

            };


            dataAbsensi.push(
                dataBaru
            );


            simpanData();


            tampilkanAbsensi();


            /* =================================
               RESET FORM
            ================================= */

            namaInput.value =
                "";

            kelasInput.value =
                "";


            document.querySelector(
                'input[name="status"][value="HADIR"]'
            ).checked =
                true;


            /* =================================
               SUKSES
            ================================= */

            tampilkanPesan(
                "🎉 Absensi berhasil dikirim!",
                "success"
            );


            tampilkanConfetti();


        } catch (error) {


            console.error(
                "EmailJS Error:",
                error
            );


            tampilkanPesan(
                "❌ Gagal mengirim absensi. Periksa EmailJS.",
                "error"
            );


        }


        /* =================================
           AKTIFKAN BUTTON
        ================================= */

        btnKirim.disabled =
            false;


        btnKirim.innerHTML =
            "<span>✓</span> KIRIM ABSENSI";


    }
);


/* =====================================
   HAPUS SEMUA DATA
===================================== */

btnHapus.addEventListener(
    "click",
    function () {


        if (
            dataAbsensi.length === 0
        ) {

            tampilkanPesan(
                "Tidak ada data untuk dihapus.",
                "error"
            );

            return;

        }


        const yakin =
            confirm(
                "Yakin ingin menghapus semua data absensi?"
            );


        if (!yakin) {

            return;

        }


        dataAbsensi =
            [];


        localStorage.removeItem(
            "dataAbsensi"
        );


        tampilkanAbsensi();


        tampilkanPesan(
            "🗑️ Semua data absensi telah dihapus.",
            "success"
        );

    }
);


/* =====================================
   AWAL
===================================== */

tampilkanAbsensi();
