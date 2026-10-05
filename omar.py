import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3
from datetime import datetime


DB = "omar.db"


# =========================
# DATABASE
# =========================

def init_db():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount INTEGER NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def add_transaction(amount, description):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO transactions (amount, description, created_at)
        VALUES (?, ?, ?)
    """, (
        amount,
        description,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()


def delete_transaction(transaction_id):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM transactions WHERE id = ?",
        (transaction_id,)
    )

    conn.commit()
    conn.close()


def get_balance():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
    """)

    balance = cursor.fetchone()[0]

    conn.close()

    return balance


def get_transactions():
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, amount, description, created_at
        FROM transactions
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return rows


# =========================
# MONEY FORMAT
# =========================

def format_money(amount):
    return f"{amount:,}".replace(",", " ") + " Dh"


def parse_amount(value):
    value = value.strip()
    value = value.replace(" ", "")
    value = value.replace(",", "")

    if not value:
        raise ValueError

    return int(value)


# =========================
# GUI
# =========================

class MoneyTracker:

    def __init__(self, root):

        self.root = root

        self.root.title("Omar - Money Tracker Project")
        self.root.geometry("700x600")
        self.root.resizable(False, False)

        self.setup_style()
        self.create_ui()

        self.root.bind("<Return>", lambda event: self.add_money())
        self.root.bind("<Escape>", lambda event: self.clear_inputs())

        self.refresh()


    # =========================
    # STYLE
    # =========================

    def setup_style(self):

        style = ttk.Style()

        style.configure(
            "Title.TLabel",
            font=("Arial", 24, "bold")
        )

        style.configure(
            "TButton",
            font=("Arial", 11),
            padding=8
        )


    # =========================
    # UI
    # =========================

    def create_ui(self):

        # TITLE
        title = ttk.Label(
            self.root,
            text="Omar - Money Tracker Project",
            style="Title.TLabel"
        )
        title.pack(pady=15)

        # BALANCE
        balance_frame = tk.Frame(
            self.root,
            bg="#222222",
            padx=20,
            pady=15
        )
        balance_frame.pack(fill="x", padx=30)

        tk.Label(
            balance_frame,
            text="Current Balance",
            bg="#222222",
            fg="white",
            font=("Arial", 12)
        ).pack()

        self.balance_label = tk.Label(
            balance_frame,
            text="0 Dh",
            bg="#222222",
            fg="#00ff88",
            font=("Arial", 28, "bold")
        )
        self.balance_label.pack()

        # INPUT
        input_frame = ttk.LabelFrame(
            self.root,
            text="New Transaction",
            padding=15
        )
        input_frame.pack(fill="x", padx=30, pady=15)

        ttk.Label(input_frame, text="Amount:").grid(row=0, column=0, padx=5, pady=5)

        self.amount_entry = ttk.Entry(
            input_frame,
            width=20,
            font=("Arial", 11)
        )
        self.amount_entry.grid(row=0, column=1, padx=5)

        ttk.Label(input_frame, text="Description:").grid(row=0, column=2, padx=5)

        self.description_entry = ttk.Entry(
            input_frame,
            width=25,
            font=("Arial", 11)
        )
        self.description_entry.grid(row=0, column=3, padx=5)

        ttk.Button(
            input_frame,
            text="+ Add Money",
            command=self.add_money
        ).grid(row=1, column=1, pady=10)

        ttk.Button(
            input_frame,
            text="- Spend Money",
            command=self.spend_money
        ).grid(row=1, column=3, pady=10)

        # HISTORY
        history_frame = ttk.LabelFrame(
            self.root,
            text="Transaction History",
            padding=10
        )
        history_frame.pack(fill="both", expand=True, padx=30, pady=5)

        columns = ("id", "amount", "description", "date")

        self.tree = ttk.Treeview(
            history_frame,
            columns=columns,
            show="headings",
            height=10
        )

        self.tree.heading("id", text="#")
        self.tree.heading("amount", text="Amount")
        self.tree.heading("description", text="Description")
        self.tree.heading("date", text="Date")

        self.tree.column("id", width=40, anchor="center")
        self.tree.column("amount", width=130, anchor="e")
        self.tree.column("description", width=200)
        self.tree.column("date", width=160)

        scrollbar = ttk.Scrollbar(
            history_frame,
            orient="vertical",
            command=self.tree.yview
        )
        self.tree.configure(yscrollcommand=scrollbar.set)

        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # COLORS FOR TAGS
        self.tree.tag_configure("income", foreground="#008000")
        self.tree.tag_configure("expense", foreground="#cc0000")

        # DELETE BUTTON
        ttk.Button(
            self.root,
            text="Delete Selected Transaction",
            command=self.delete_selected
        ).pack(pady=10)


    # =========================
    # ADD MONEY
    # =========================

    def add_money(self):
        try:
            amount = parse_amount(self.amount_entry.get())
        except ValueError:
            messagebox.showerror(
                "Error",
                "Enter a valid amount.\n\nExample: 5000 or 5 000"
            )
            return

        if amount == 0:
            messagebox.showerror("Error", "Amount cannot be 0.")
            return

        if amount < 0:
            self.spend_money(amount_override=abs(amount))
            return

        description = self.description_entry.get().strip()
        if not description:
            description = "Income"

        add_transaction(amount, description)
        self.clear_inputs()
        self.refresh()


    # =========================
    # SPEND MONEY
    # =========================

    def spend_money(self, amount_override=None):
        if amount_override is None:
            try:
                amount = parse_amount(self.amount_entry.get())
            except ValueError:
                messagebox.showerror(
                    "Error",
                    "Enter a valid amount.\n\nExample: 5000 or 5 000"
                )
                return

            amount = abs(amount)
        else:
            amount = amount_override

        if amount == 0:
            messagebox.showerror("Error", "Amount cannot be 0.")
            return

        balance = get_balance()

        if amount > balance:
            messagebox.showwarning(
                "Not enough money",
                "You don't have enough money.\n\n"
                f"Current balance: {format_money(balance)}\n"
                f"Requested: {format_money(amount)}"
            )
            return

        description = self.description_entry.get().strip()
        if not description:
            description = "Expense"

        add_transaction(-amount, description)
        self.clear_inputs()
        self.refresh()


    # =========================
    # DELETE TRANSACTION
    # =========================

    def delete_selected(self):
        selected = self.tree.selection()

        if not selected:
            messagebox.showwarning("No selection", "Select a transaction first.")
            return

        item = self.tree.item(selected[0])
        values = item["values"]

        transaction_id = values[0]
        amount = values[1]
        description = values[2]

        answer = messagebox.askyesno(
            "Delete Transaction",
            f"Delete this transaction?\n\n{amount}\n{description}"
        )

        if not answer:
            return

        delete_transaction(transaction_id)
        self.refresh()


    # =========================
    # REFRESH
    # =========================

    def refresh(self):
        balance = get_balance()

        self.balance_label.config(text=format_money(balance))

        if balance > 0:
            self.balance_label.config(fg="#00ff88")
        elif balance == 0:
            self.balance_label.config(fg="white")
        else:
            self.balance_label.config(fg="#ff4444")

        for item in self.tree.get_children():
            self.tree.delete(item)

        for row in get_transactions():
            transaction_id = row[0]
            amount = row[1]
            description = row[2]
            date = row[3]

            if amount >= 0:
                formatted_amount = "+" + format_money(amount)
                tag = "income"
            else:
                formatted_amount = "-" + format_money(abs(amount))
                tag = "expense"

            self.tree.insert(
                "",
                "end",
                values=(transaction_id, formatted_amount, description, date),
                tags=(tag,)
            )


    # =========================
    # CLEAR INPUTS
    # =========================

    def clear_inputs(self):
        self.amount_entry.delete(0, tk.END)
        self.description_entry.delete(0, tk.END)
        self.amount_entry.focus()


# =========================
# START APP
# =========================

if __name__ == "__main__":
    init_db()
    root = tk.Tk()
    app = MoneyTracker(root)
    root.mainloop()

