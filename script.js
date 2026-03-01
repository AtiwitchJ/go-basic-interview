// URL ของ API server
const API_URL = 'http://localhost:8080/api/users';

// ตัวแปรสำหรับเก็บข้อมูลผู้ใช้ทั้งหมด
let allUsers = [];

// loadAllUsers ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด
async function loadAllUsers() {
    const container = document.getElementById('users-container');
    container.innerHTML = '<p>กำลังโหลดข้อมูล...</p>';

    try {
        // เรียก API สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
        const response = await fetch(API_URL);
        console.log("Response status:", response.status);

        if (!response.ok) throw new Error('Failed to fetch users');

        // แปลง response เป็น JSON
        const data = await response.json();
        console.log("Data received:", data);
        allUsers = data;

        if (allUsers.length === 0) {
            container.innerHTML = '<p>ไม่มีข้อมูลผู้ใช้</p>';
            return;
        }

        // แสดง dropdown เลือก user
        renderUserSelect();
        // แสดงตารางข้อมูล
        renderTable(allUsers);
    } catch (error) {
        container.innerHTML = `<p>เกิดข้อผิดพลาด: ${error.message}</p>`;
    }
}

// renderUserSelect ฟังก์ชันสำหรับสร้าง dropdown เลือก user
function renderUserSelect() {
    const select = document.getElementById('user-select');
    select.innerHTML = '<option value="">-- เลือก User --</option>';
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.id} - ${user.first_name} ${user.last_name}`;
        select.appendChild(option);
    });
}

// renderTable ฟังก์ชันสำหรับแสดงตารางข้อมูลผู้ใช้
function renderTable(users) {
    const container = document.getElementById('users-container');

    container.innerHTML = `
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>ชื่อ</th>
                    <th>นามสกุล</th>
                    <th>เพศ</th>
                    <th>วันเกิด</th>
                    <th>เบอร์โทร</th>
                    <th>ที่อยู่</th>
                    <th>เมือง</th>
                    <th>ประเทศ</th>
                    <th>รหัสไปรษณีย์</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.email || '-'}</td>
                        <td>${user.first_name || '-'}</td>
                        <td>${user.last_name || '-'}</td>
                        <td>${user.gender || '-'}</td>
                        <td>${user.birth_date || '-'}</td>
                        <td>${user.phone || '-'}</td>
                        <td>${user.address || '-'}</td>
                        <td>${user.city || '-'}</td>
                        <td>${user.country || '-'}</td>
                        <td>${user.postal_code || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// viewUser ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ตาม ID ที่เลือก
async function viewUser(id) {
    console.log("viewUser ได้รับ id:", id, "type:", typeof id);

    // ถ้าไม่ได้เลือก หรือ id เป็น undefined หรือ empty string หรือ string "undefined" แสดงข้อมูลทั้งหมด
    if (id === undefined || id === null || id === '' || id === 'undefined') {
        console.log("ไม่ได้เลือก user แสดงทั้งหมด");
        renderTable(allUsers);
        return;
    }

    const container = document.getElementById('users-container');
    container.innerHTML = '<p>กำลังโหลดข้อมูล...</p>';

    console.log("กำลังดึงข้อมูล user ID:", id);

    try {
        // เรียก API สำหรับดึงข้อมูลผู้ใช้ตาม ID
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                container.innerHTML = '<p>ไม่พบผู้ใช้</p>';
            } else {
                throw new Error('Failed to fetch user');
            }
            return;
        }

        // แปลง response เป็น JSON และแสดงตาราง
        const user = await response.json();
        renderTable([user]);
    } catch (error) {
        container.innerHTML = `<p>เกิดข้อผิดพลาด: ${error.message}</p>`;
    }
}
