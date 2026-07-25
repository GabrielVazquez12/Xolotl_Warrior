# Xolotl Warrior 👻

> **Xolotl Warrior** is an indie action game built for the HackaTec video game design challenge. Guide a brave little ghost with a warrior's spirit through a mysterious adventure.

## 🎮 Overview

Currently in active development, this project features a custom-built game engine architecture using **Kaboom.js**. Players must use spectral dashes, dodge enemies, and manage their health to protect the core and survive the incoming hordes.

## 🛠️ Tech Stack

*   **Engine:** [Kaboom.js](https://kaboomjs.com/)
*   **Frontend:** Vanilla JavaScript (ES6 Modules), HTML5, CSS3
*   **Architecture:** Modular component-based structure (Separation of Concerns)
*   **Infrastructure (Planned):** AWS (DynamoDB for global leaderboards)

## 🚀 How to Run Locally (Development)

Due to the use of modern ES6 Modules for the game architecture, you cannot open `index.html` directly in the browser. You need to start a local server to avoid CORS issues.

1. Clone the repository:
   ```bash
   git clone [https://github.com/GabrielVazquez12/Xolotl_Warrior.git](https://github.com/GabrielVazquez12/Xolotl_Warrior.git)

    Navigate to the frontend directory:
    Bash

    cd Xolotl_Warrior/frontend

    Start a local web server:

        Using Python: python3 -m http.server 8000

        Using Node.js: npx serve

    Open your browser and navigate to http://localhost:8000

🕹️ Controls

    A / D or Left / Right Arrows: Move

    SHIFT: Run

    SPACE (x2): Fly / Hover (Kirby style)

    Q: Spectral Dash (Grants temporary invulnerability)

    J: Melee Sword Attack

    K: Spectral Laser

