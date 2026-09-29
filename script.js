const SERVICE_ID = "service_0j76nj5";
const TEMPLATE_ID = "template_u46s6wk";

const namaInput = document.getElementById("nama");

const statusInputs =
    document.querySelectorAll('input[name="status"]');

const btnKirim = document.getElementById("btnKirim");

const pesan = document.getElementById("pesan");

const tanggalElement = document.getElementById("tanggal");

const jamElement = document.getElementById("jam");

const daftarAbsensi =
    document.getElementById("daftarAbsensi");

const jumlahElement =
    document.getElementById("jumlah");

const btnHapus =
    document.getElementById("btnHapus");


/* =========================
   DATA ABSENSI
========================= */

let dataAbsensi =
    JSON.parse(
        localStorage.getItem("dataAbsensi")
    ) || [];


/* =========================
   WAKTU WIB
========================= */

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


/* =========================
   UPDATE JAM
========================= */

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


/* =========================
   SIMPAN
========================= */

function simpanData() {

    localStorage.setItem(
        "dataAbsensi",
        JSON.stringify(dataAbsensi)
    );
}


/* =========================
   TAMPILKAN
========================= */

function tampilkanAbsensi() {

    jumlahElement.textContent =
        dataAbsensi.length;


    if (dataAbsensi.length === 0) {

        daftarAbsensi.innerHTML = `
            <div class="empty">
                <div>📝</div>
                <p>
                    Belum ada siswa yang absen
                </p>
            </div>
        `;

        return;
    }


    daftarAbsensi.innerHTML = "";


    dataAbsensi.forEach(
        siswa => {

            const item =
                document.createElement("div");

            item.className =
                "student";


            const huruf =
                siswa.nama
                    .trim()
                    .charAt(0)
                    .toUpperCase();


            item.innerHTML = `

                <div class="avatar">
                    ${huruf}
                </div>

                <div class="student-info">

                    <strong>
                        ${escapeHTML(
                            siswa.nama
                        )}
                    </strong>

                    <small>
                        ${siswa.tanggal}
                        •
                        ${siswa.waktu}
                        WIB
                    </small>

                </div>

                <div class="status">
                    ${escapeHTML(
                        siswa.status || "HADIR"
                    )}
                </div>

            `;


            daftarAbsensi
                .appendChild(item);

        }
    );
}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   KIRIM ABSENSI
========================= */

btnKirim.addEventListener(
    "click",
    async function () {

        const nama =
            namaInput.value.trim();


        if (nama === "") {

            tampilkanPesan(
                "Masukkan nama kamu terlebih dahulu!",
                "error"
            );

            namaInput.focus();

            return;
        }


        const statusInput =
            document.querySelector(
                'input[name="status"]:checked'
            );


        if (!statusInput) {

            tampilkanPesan(
                "Pilih status kehadiran terlebih dahulu!",
                "error"
            );

            return;
        }


        const status =
            statusInput.value;


        const waktu =
            getWaktuWIB();


        /*
           CEK DUPLIKAT
           Hanya pada tanggal yang sama
        */

        const sudahAda =
            dataAbsensi.some(
                siswa =>
                    siswa.nama
                        .toLowerCase() ===
                    nama.toLowerCase()
                    &&
                    siswa.tanggal ===
                    waktu.tanggal
            );


        if (sudahAda) {

            tampilkanPesan(
                "Nama tersebut sudah absen hari ini.",
                "error"
            );

            return;
        }


        /*
           NONAKTIFKAN BUTTON
        */

        btnKirim.disabled = true;

        btnKirim.innerHTML =
            "⏳ Mengirim...";


        try {

            /*
               DATA YANG DIKIRIM KE EMAILJS
            */

            const templateParams = {

                nama: nama,

                status: status,

                tanggal:
                    waktu.tanggal,

                waktu:
                    waktu.waktu

            };


            /*
               KIRIM EMAIL
            */

            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams
            );


            /*
               JIKA BERHASIL
            */

            const dataBaru = {

                nama: nama,

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


            namaInput.value = "";


            document.querySelector(
                'input[name="status"][value="HADIR"]'
            ).checked = true;


            tampilkanPesan(
                "✓ Absensi berhasil dikirim ke Gmail!",
                "success"
            );


        } catch (error) {

            console.error(
                "EmailJS Error:",
                error
            );


            tampilkanPesan(
                "❌ Gagal mengirim. Periksa konfigurasi EmailJS.",
                "error"
            );

        }


        /*
           AKTIFKAN LAGI
        */

        btnKirim.disabled = false;

        btnKirim.innerHTML =
            "<span>✓</span> KIRIM ABSENSI";

    }
);


/* =========================
   PESAN
========================= */

function tampilkanPesan(
    teks,
    tipe
) {

    pesan.textContent =
        teks;

    pesan.className =
        tipe;


    setTimeout(
        () => {

            pesan.textContent =
                "";

            pesan.className =
                "";

        },
        4000
    );
}


/* =========================
   HAPUS DATA
========================= */

btnHapus.addEventListener(
    "click",
    function () {

        if (
            dataAbsensi.length === 0
        ) {
            return;
        }


        const yakin =
            confirm(
                "Yakin ingin menghapus semua data absensi?"
            );


        if (!yakin) {
            return;
        }


        dataAbsensi = [];


        localStorage.removeItem(
            "dataAbsensi"
        );


        tampilkanAbsensi();


        tampilkanPesan(
            "Semua data absensi telah dihapus.",
            "success"
        );

    }
);


/* =========================
   AWAL
========================= */

tampilkanAbsensi();
