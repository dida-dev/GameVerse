import tkinter as tk
from tkinter import messagebox
import random

# --- GAME DATABASE ---
YOKAI_DATABASE = {
    "jibanyan": {"name": "Jibanyan", "tribe": "Charming", "color": "#FF6B6B", "max_hp": 100, "attack": 18, "soultimate": "Paws of Fury"},
    "komasan": {"name": "Komasan", "tribe": "Charming", "color": "#4D96FF", "max_hp": 120, "attack": 15, "soultimate": "Spirit Dance"},
    "whisper": {"name": "Whisper", "tribe": "Slippery", "color": "#E1E5EA", "max_hp": 80, "attack": 8, "soultimate": "Sycophant Slap"},
    "shogunyan": {"name": "Shogunyan", "tribe": "Brave", "color": "#6BCB77", "max_hp": 140, "attack": 32, "soultimate": "Bonito Blade"},
    "blizzaria": {"name": "Blizzaria", "tribe": "Charming", "color": "#6ECBFF", "max_hp": 110, "attack": 22, "soultimate": "Snowstorm"}
}

BOSS_DATABASE = {
    "name": "Slimamander",
    "max_hp": 600,
    "attack": 25,
    "color": "#9B5DE5"
}

class FullYokaiGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Yo-kai Watch: Battle Engine")
        self.root.geometry("750x650")
        self.root.configure(bg="#1A1A24")

        # --- GAME STATE ---
        self.medal_box = ["jibanyan", "komasan", "whisper"]
        self.selected_medal = None
        
        # Team active composition track (holds live mutable dictionaries)
        self.active_team = [None, None, None] 
        
        # Enemy Boss state
        self.boss_hp = BOSS_DATABASE["max_hp"]
        self.game_active = False

        self.setup_ui()
        self.initialize_starting_team()

    def setup_ui(self):
        # 1. HEADER TITLE
        title = tk.Label(self.root, text="YO-KAI WATCH: COMBAT CHRONICLES", 
                         font=("Courier", 18, "bold"), fg="#F9ED69", bg="#1A1A24")
        title.pack(pady=10)

        # 2. BOSS BATTLEFIELD CONTAINER
        self.boss_frame = tk.LabelFrame(self.root, text=" ENEMY BOSS STATE ", 
                                        font=("Arial", 10, "bold"), fg="white", bg="#2D2D3A", padx=10, pady=10)
        self.boss_frame.pack(fill="x", padx=20, pady=5)
        
        self.boss_name_label = tk.Label(self.boss_frame, text=BOSS_DATABASE["name"], font=("Arial", 14, "bold"), fg="#FF4A4A", bg="#2D2D3A")
        self.boss_name_label.pack()
        
        self.boss_hp_label = tk.Label(self.boss_frame, text=f"HP: {self.boss_hp}/{BOSS_DATABASE['max_hp']}", font=("Arial", 11), fg="white", bg="#2D2D3A")
        self.boss_hp_label.pack()

        # 3. LIVE COMBAT BATTLE WHEEL SLOTS
        self.wheel_frame = tk.LabelFrame(self.root, text=" ACTIVE BATTLE ROSTER ", 
                                         font=("Arial", 10, "bold"), fg="white", bg="#2D2D3A", padx=10, pady=10)
        self.wheel_frame.pack(fill="x", padx=20, pady=5)

        self.slot_frames = []
        self.slot_labels = []
        self.soultimate_buttons = []

        for i in range(3):
            sf = tk.Frame(self.wheel_frame, bg="#1A1A24", bd=2, relief="ridge", pading=5)
            sf.pack(side="left", expand=True, padx=8, pady=5)
            self.slot_frames.append(sf)

            lbl = tk.Label(sf, text=f"Slot {i+1}\n[ EMPTY ]", font=("Arial", 11, "bold"), fg="#777788", bg="#1A1A24", width=16, height=4)
            lbl.pack(pady=5)
            self.slot_labels.append(lbl)

            s_btn = tk.Button(sf, text="SOULTIMATE", font=("Arial", 9, "bold"), state="disabled", bg="#444455", fg="white",
                              command=lambda idx=i: self.use_soultimate(idx))
            s_btn.pack(pady=20)
            self.soultimate_buttons.append(s_btn)

        # 4. MEDAL BOX & MANAGEMENT
        self.management_frame = tk.Frame(self.root, bg="#1A1A24")
        self.management_frame.pack(fill="x", padx=20, pady=5)

        self.inv_frame = tk.LabelFrame(self.management_frame, text=" MEDAL BOX INVENTORY (Click to Select) ", 
                                       font=("Arial", 9, "bold"), fg="white", bg="#2D2D3A", padx=10, pady=5)
        self.inv_frame.pack(side="left", expand=True, fill="both", padx=5)

        self.medal_buttons_container = tk.Frame(self.inv_frame, bg="#2D2D3A")
        self.medal_buttons_container.pack()
        self.render_medal_box()

        # 5. ENGINE ACTIONS & ROUND RUNNERS
        self.actions_frame = tk.LabelFrame(self.management_frame, text=" TACTICAL CONTROLS ", 
                                           font=("Arial", 9, "bold"), fg="white", bg="#2D2D3A", padx=10, pady=5)
        self.actions_frame.pack(side="right", fill="both", padx=5)

        self.turn_btn = tk.Button(self.actions_frame, text="⚔️ FIGHT NEXT ROUND", font=("Arial", 11, "bold"), bg="#FF4A4A", fg="white", height=2, command=self.execute_battle_round)
        self.turn_btn.pack(fill="x", pady=5)

        find_btn = tk.Button(self.actions_frame, text="🔍 Find Hidden Medal", font=("Arial", 10), bg="#F9ED69", fg="black", command=self.discover_medal)
        find_btn.pack(fill="x", pady=2)

        # 6. CONSOLE LOG EVENTS RUNNER
        log_frame = tk.LabelFrame(self.root, text=" BATTLE LOG ", font=("Arial", 9, "bold"), fg="white", bg="#2D2D3A")
        log_frame.pack(fill="both", expand=True, padx=20, pady=10)

        self.log_text = tk.Text(log_frame, font=("Courier", 10), bg="black", fg="#6ECBFF", state="disabled", height=8)
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)
        self.log_message("System Initialized. Team loaded. Press 'FIGHT NEXT ROUND' to engage the Boss!")

    def initialize_starting_team(self):
        """Pre-populates the base team so the game is ready instantly."""
        for idx, key in enumerate(["jibanyan", "komasan", "whisper"]):
            db_profile = YOKAI_DATABASE[key]
            self.active_team[idx] = {
                "id": key, "name": db_profile["name"], "tribe": db_profile["tribe"],
                "max_hp": db_profile["max_hp"], "hp": db_profile["max_hp"],
                "attack": db_profile["attack"], "color": db_profile["color"],
                "soultimate": db_profile["soultimate"], "soul_charge": 0
            }
        self.update_battlefield_graphics()
        self.game_active = True

    def render_medal_box(self):
        for widget in self.medal_buttons_container.winfo_children():
            widget.destroy()

        for idx, y_id in enumerate(self.medal_box):
            data = YOKAI_DATABASE[y_id]
            # Context safe closure setup
            btn = tk.Button(self.medal_buttons_container, text=data["name"], font=("Arial", 9, "bold"),
                            bg=data["color"], fg="black", width=10, height=2,
                            command=lambda key=y_id: self.select_medal(key))
            btn.grid(row=idx // 3, column=idx % 3, padx=4, pady=4)

    def select_medal(self, yokai_id):
        self.selected_medal = yokai_id
        name = YOKAI_DATABASE[yokai_id]["name"]
        self.log_message(f"Selected {name} Medal. Click on one of the active slots above to overwrite/summon!")

        # Convert battle slot headers momentarily into functional selection paths
        for i in range(3):
            self.slot_labels[i].config(text=f"👉 Click to\nSummon Here 👈", bg="#3A3F58", fg="#F9ED69")
            self.slot_labels[i].bind("<Button-1>", lambda event, idx=i: self.complete_summon(idx))

    def complete_summon(self, slot_index):
        if not self.selected_medal:
            return
        
        db_profile = YOKAI_DATABASE[self.selected_medal]
        self.active_team[slot_index] = {
            "id": self.selected_medal, "name": db_profile["name"], "tribe": db_profile["tribe"],
            "max_hp": db_profile["max_hp"], "hp": db_profile["max_hp"],
            "attack": db_profile["attack"], "color": db_profile["color"],
            "soultimate": db_profile["soultimate"], "soul_charge": 0
        }
        
        self.log_message(f"✨ Summoned {db_profile['name']} into Active Slot {slot_index+1}!")
        self.selected_medal = None
        
        # Unbind click listening overrides
        for i in range(3):
            self.slot_labels[i].unbind("<Button-1>")
            
        self.update_battlefield_graphics()

    def update_battlefield_graphics(self):
        """Synchronizes current dictionary parameters directly with display frames."""
        # Update Boss
        self.boss_hp_label.config(text=f"HP: {self.boss_hp}/{BOSS_DATABASE['max_hp']}")
        
        # Update Yo-kai Slots
        for i in range(3):
            yokai = self.active_team[i]
            if yokai:
                status_text = f"{yokai['name']}\nHP: {yokai['hp']}/{yokai['max_hp']}\nSoul: {yokai['soul_charge']}%"
                self.slot_labels[i].config(text=status_text, bg=yokai["color"], fg="black")
                
                # Activate Soultimate buttons if criteria is reached
                if yokai["soul_charge"] >= 100 and yokai["hp"] > 0:
                    self.soultimate_buttons[i].config(state="normal", bg="#F9ED69", text="✨ READY! ✨", fg="black")
                else:
                    self.soultimate_buttons[i].config(state="disabled", bg="#444455", text=f"Charge: {yokai['soul_charge']}%", fg="white")
            else:
                self.slot_labels[i].config(text=f"Slot {i+1}\n[ EMPTY ]", bg="#1A1A24", fg="#777788")
                self.soultimate_buttons[i].config(state="disabled", bg="#444455", text="LOCKED")

    def use_soultimate(self, slot_index):
        if not self.game_active: return
        yokai = self.active_team[slot_index]
        
        # Calculate raw heavy strike damage values
        dmg = int(yokai["attack"] * 2.5)
        self.boss_hp = max(0, self.boss_hp - dmg)
        yokai["soul_charge"] = 0
        
        self.log_message(f"🔥 S-MOVE: {yokai['name']} unleashes [{yokai['soultimate']}] for {dmg} DMG!")
        self.update_battlefield_graphics()
        self.check_game_over_conditions()

    def execute_battle_round(self):
        """Simulates an automatic structural attack round where players and enemies exchange blows."""
        if not self.game_active:
            return

        # 1. LIVE TEAM ATTTACK INDIVIDUAL LOOPS
        active_fighters = [y for y in self.active_team if y is not None and y["hp"] > 0]
        
        if not active_fighters:
            self.log_message("❌ All active team members are knocked out! You cannot attack.")
            self.check_game_over_conditions()
            return

        for yokai in active_fighters:
            # Varied output damage calculator
            variance = random.randint(-3, 5)
            final_dmg = max(1, yokai["attack"] + variance)
            self.boss_hp = max(0, self.boss_hp - final_dmg)
            
            # Boost Soul Charge values
            yokai["soul_charge"] = min(100, yokai["soul_charge"] + random.randint(25, 40))
            self.log_message(f"⚔️ {yokai['name']} attacks {BOSS_DATABASE['name']} for {final_dmg} damage.")

        # 2. BOSS ATTACKS COUNTER STRIKES 
        if self.boss_hp > 0:
            target_yokai = random.choice(active_fighters)
            boss_dmg = BOSS_DATABASE["attack"] + random.randint(-4, 4)
            target_yokai["hp"] = max(0, target_yokai["hp"] - boss_dmg)
            self.log_message(f"💥 {BOSS_DATABASE['name']} retaliates and strikes {target_yokai['name']} for {boss_dmg} damage!")
            
            if target_yokai["hp"] <= 0:
                self.log_message(f"💀 {target_yokai['name']} has passed out!")

        self.update_battlefield_graphics()
        self.check_game_over_conditions()

    def discover_medal(self):
        locked_pool = [k for k in YOKAI_DATABASE if k not in self.medal_box]
        if not locked_pool:
            self.log_message("Inventory Complete! No more hidden local medals found.")
            return
        
        new_id = random.choice(locked_pool)
        self.medal_box.append(new_id)
        self.render_medal_box()
        self.log_message(f"🎉 Lucky! Found a new {YOKAI_DATABASE[new_id]['name']} Medal in the wild!")

    def log_message(self, text):
        self.log_text.config(state="normal")
        self.log_text.insert(tk.END, text + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state="disabled")

    def check_game_over_conditions(self):
        if self.boss_hp <= 0:
            self.game_active = False
            messagebox.showinfo("VICTORY!", f"🏆 You defeated {BOSS_DATABASE['name']}! You are a master Yo-kai handler!")
            self.root.destroy()
        elif all(y is None or y["hp"] <= 0 for y in self.active_team):
            self.game_active = False
            messagebox.showerror("DEFEAT", "💔 Your entire team has fainted! Game Over.")
            self.root.destroy()

# --- INSTANTIATE APP ENGINE ---
if __name__ == "__main__":
    app_root = tk.Tk()
    engine = FullYokaiGame(app_root)
    app_root.mainloop()