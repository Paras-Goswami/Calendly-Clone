# 📅 Schedulr - Meeting Scheduling Web App

Schedulr is a full-stack scheduling application inspired by Calendly. It allows users to create event types, set availability, and let others book meetings seamlessly.

---

## 🚀 Features

- Create and manage event types
- Set weekly availability
- Public booking page for scheduling meetings
- Automatic time slot generation
- Prevent double booking
- View **Upcoming & Past Meetings**
- Cancel scheduled meetings
- Clean and responsive UI

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router

### Backend
- FastAPI
- SQLAlchemy
- SQLite / PostgreSQL

---

## 📌 Important Note (MUST READ)

⚠️ **Meeting will only be scheduled when you open the booking link in a separate tab.**

👉 Steps:
1. Go to **Event Types**
2. Copy the generated booking link
3. Open it in a **new tab**
4. Fill details and schedule meeting

✔️ Only then the meeting will be stored and shown in dashboard.

---

## 📂 How It Works

### 1. Create Event Type
- Add title and duration
- Generates a public booking link

### 2. Set Availability
- Define your working hours
- Slots are generated automatically

### 3. Book Meeting
- User selects date & time
- Fills details
- Meeting is created

### 4. Meetings Dashboard
- View:
  - Upcoming Meetings
  - Past Meetings
- Cancel meetings if needed

---

## ⚙️ Setup Instructions

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints

- `/event-types`
- `/availability`
- `/book/{slug}`
- `/meetings/upcoming`
- `/meetings/past`
- `/meetings/{id}/cancel`

---

## 💡 Key Learnings

- Full-stack integration (React + FastAPI)
- API handling & async requests
- State management using custom hooks
- Pagination handling in frontend
- Backend validation & scheduling logic

---

## ✨ Future Improvements

- Authentication (Login/Signup)
- Google Calendar Integration
- Email Notifications
- Timezone Handling
- Admin Dashboard Enhancements

---

## 👩‍💻 Author

Paras Goswami

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!
