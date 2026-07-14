-- Stores shift schedules per staff member
CREATE TABLE staff_schedules (
    schedule_id SERIAL PRIMARY KEY,
    staff_id    INTEGER NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    shift_date  DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end   TIME NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks daily time-in / time-out attendance per staff member
CREATE TABLE staff_attendance (
    attendance_id SERIAL PRIMARY KEY,
    staff_id      INTEGER NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    schedule_id   INTEGER REFERENCES staff_schedules(schedule_id),
    date          DATE NOT NULL,
    time_in       TIMESTAMP,
    time_out      TIMESTAMP,
    status        VARCHAR(20) DEFAULT 'Present'
                      CHECK (status IN ('Present','Absent','Late','On Leave'))
);