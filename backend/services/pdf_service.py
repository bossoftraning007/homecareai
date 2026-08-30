"""PDF Report Generation Service for Health Reports."""
from datetime import datetime, timedelta
from io import BytesIO
from typing import Optional
from fpdf import FPDF


class HealthReportPDF(FPDF):
    """Custom PDF class for health reports."""

    def __init__(self, title: str = "Health Report"):
        super().__init__()
        self.title = title
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        """Add header to each page."""
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "HomeCare AI", 0, 0, "L")
        self.cell(0, 8, self.title, 0, 1, "R")
        self.set_draw_color(16, 185, 129)
        self.set_line_width(0.5)
        self.line(10, 18, 200, 18)
        self.ln(8)

    def footer(self):
        """Add footer to each page."""
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", 0, 0, "C")
        self.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d')}", 0, 0, "R")

    def section_title(self, title: str):
        """Add a section title."""
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(16, 185, 129)
        self.cell(0, 10, title, 0, 1, "L")
        self.set_draw_color(16, 185, 129)
        self.set_line_width(0.3)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def body_text(self, text: str):
        """Add body text."""
        self.set_font("Helvetica", "", 10)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text)
        self.ln(2)

    def stat_box(self, label: str, value: str, x: float, y: float, w: float = 45):
        """Draw a stat box."""
        self.set_xy(x, y)
        self.set_fill_color(240, 253, 244)
        self.set_draw_color(16, 185, 129)
        self.set_line_width(0.2)
        self.rect(x, y, w, 20, "DF")

        self.set_xy(x, y + 2)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(100, 100, 100)
        self.cell(w, 5, label, 0, 1, "C")

        self.set_x(x)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(16, 185, 129)
        self.cell(w, 8, value, 0, 1, "C")

    def table_row(self, col1: str, col2: str, col3: str, col4: str, is_header: bool = False):
        """Add a table row."""
        if is_header:
            self.set_font("Helvetica", "B", 9)
            self.set_fill_color(16, 185, 129)
            self.set_text_color(255, 255, 255)
        else:
            self.set_font("Helvetica", "", 9)
            self.set_text_color(50, 50, 50)
            self.set_fill_color(245, 245, 245) if self.get_y() % 20 < 10 else None

        self.cell(60, 7, col1, 1, 0, "C", is_header)
        self.cell(40, 7, col2, 1, 0, "C", is_header)
        self.cell(40, 7, col3, 1, 0, "C", is_header)
        self.cell(50, 7, col4, 1, 1, "C", is_header)


def generate_weekly_report(
    user_name: str,
    week_start: str,
    week_end: str,
    wellness_logs: list,
    medications: list,
    symptoms: list,
    insights: dict,
) -> bytes:
    """Generate a weekly health report PDF."""
    pdf = HealthReportPDF("Weekly Health Report")
    pdf.alias_nb_pages()
    pdf.add_page()

    # Title section
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 12, "Weekly Health Report", 0, 1, "C")

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f"Patient: {user_name}", 0, 1, "C")
    pdf.cell(0, 8, f"Period: {week_start} to {week_end}", 0, 1, "C")
    pdf.ln(8)

    # Summary stats
    pdf.section_title("Summary")

    avg_sleep = insights.get("averages", {}).get("sleep_hours", 0)
    avg_quality = insights.get("averages", {}).get("sleep_quality", 0)
    avg_energy = insights.get("averages", {}).get("energy_level", 0)
    avg_water = insights.get("averages", {}).get("water_glasses", 0)

    start_y = pdf.get_y()
    pdf.stat_box("Avg Sleep", f"{avg_sleep}h", 10, start_y)
    pdf.stat_box("Sleep Quality", f"{avg_quality}/5", 55, start_y)
    pdf.stat_box("Energy Level", f"{avg_energy}/5", 100, start_y)
    pdf.stat_box("Water Intake", f"{avg_water} glasses", 145, start_y)

    pdf.ln(28)

    # Sleep section
    if wellness_logs:
        pdf.section_title("Sleep & Mood Tracking")

        pdf.table_row("Date", "Sleep Hours", "Quality", "Mood", True)
        for log in wellness_logs[:7]:
            mood_emoji = {"happy": "Happy", "sad": "Sad", "calm": "Calm", "energetic": "Energetic",
                         "tired": "Tired", "anxious": "Anxious", "stressed": "Stressed"}.get(log.get("mood", ""), "-")
            pdf.table_row(
                log.get("log_date", "-"),
                f"{log.get('sleep_hours', '-')}h" if log.get("sleep_hours") else "-",
                f"{log.get('sleep_quality', '-')}/5" if log.get("sleep_quality") else "-",
                mood_emoji,
            )
        pdf.ln(5)

    # Medications section
    if medications:
        pdf.section_title("Medication Tracker")

        pdf.table_row("Medication", "Dosage", "Frequency", "Status", True)
        for med in medications:
            status = "Active" if med.get("is_active") else "Paused"
            pdf.table_row(
                med.get("name", "-"),
                med.get("dosage", "-"),
                med.get("frequency", "-"),
                status,
            )
        pdf.ln(5)

    # Symptoms section
    if symptoms:
        pdf.section_title("Symptoms Log")

        pdf.table_row("Date", "Symptom", "Severity", "Status", True)
        for symptom in symptoms[:10]:
            pdf.table_row(
                symptom.get("date", "-")[:10],
                symptom.get("symptom", "-"),
                f"{symptom.get('severity', '-')}/10",
                symptom.get("status", "-"),
            )
        pdf.ln(5)

    # Insights section
    if insights.get("insights"):
        pdf.section_title("Personalized Insights")
        for insight in insights["insights"]:
            pdf.body_text(f"- {insight}")
        pdf.ln(5)

    # Mood distribution
    mood_dist = insights.get("mood_distribution", {})
    if mood_dist:
        pdf.section_title("Mood Distribution")
        mood_labels = {"happy": "Happy", "sad": "Sad", "calm": "Calm", "energetic": "Energetic",
                      "tired": "Tired", "anxious": "Anxious", "stressed": "Stressed", "angry": "Angry"}
        total = sum(mood_dist.values())
        for mood, count in sorted(mood_dist.items(), key=lambda x: x[1], reverse=True):
            pct = round((count / total) * 100) if total > 0 else 0
            label = mood_labels.get(mood, mood)
            pdf.body_text(f"{label}: {count} days ({pct}%)")
        pdf.ln(3)

    # Footer note
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.multi_cell(0, 5, "This report is generated by HomeCare AI for informational purposes only. "
                   "It does not replace professional medical advice. Please consult your healthcare provider "
                   "for any health concerns.", 0, "C")

    return pdf.output()


def generate_monthly_report(
    user_name: str,
    month_name: str,
    wellness_logs: list,
    medications: list,
    symptoms: list,
    insights: dict,
) -> bytes:
    """Generate a monthly health report PDF."""
    pdf = HealthReportPDF("Monthly Health Report")
    pdf.alias_nb_pages()
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 12, "Monthly Health Report", 0, 1, "C")

    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f"Patient: {user_name}", 0, 1, "C")
    pdf.cell(0, 8, f"Month: {month_name}", 0, 1, "C")
    pdf.ln(8)

    # Summary
    pdf.section_title("Monthly Overview")

    total_logs = len(wellness_logs)
    total_meds = len(medications)
    total_symptoms = len(symptoms)

    start_y = pdf.get_y()
    pdf.stat_box("Days Tracked", str(total_logs), 10, start_y)
    pdf.stat_box("Medications", str(total_meds), 55, start_y)
    pdf.stat_box("Symptoms", str(total_symptoms), 100, start_y)
    pdf.stat_box("Most Common Mood", insights.get("most_common_mood", "-").title(), 145, start_y)

    pdf.ln(28)

    # Averages
    pdf.section_title("30-Day Averages")
    avg = insights.get("averages", {})
    pdf.body_text(f"Average Sleep: {avg.get('sleep_hours', 0)} hours per night")
    pdf.body_text(f"Sleep Quality: {avg.get('sleep_quality', 0)}/5")
    pdf.body_text(f"Energy Level: {avg.get('energy_level', 0)}/5")
    pdf.body_text(f"Water Intake: {avg.get('water_glasses', 0)} glasses per day")
    pdf.body_text(f"Exercise: {avg.get('exercise_minutes', 0)} minutes per day")
    pdf.ln(5)

    # Insights
    if insights.get("insights"):
        pdf.section_title("AI Insights")
        for insight in insights["insights"]:
            pdf.body_text(f"- {insight}")
        pdf.ln(3)

    # Footer
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.multi_cell(0, 5, "Generated by HomeCare AI. Not a substitute for professional medical advice.", 0, "C")

    return pdf.output()
