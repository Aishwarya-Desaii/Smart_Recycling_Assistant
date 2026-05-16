"""
model/inference/labels.py
─────────────────────────────────────────────────────────
Maps each waste class → rich guidance data.
This is what gets returned to the frontend after prediction.
─────────────────────────────────────────────────────────
"""

WASTE_GUIDANCE = {
    "plastic": {
        "label": "Plastic",
        "bin_color": "yellow",
        "bin_emoji": "🟡",
        "recyclable": True,
        "reward_points": 10,
        "instructions": [
            "Empty and rinse the container before disposal.",
            "Remove caps and lids (recycle separately).",
            "Crush bottles to save space.",
            "Check for recycling symbol (♻) and number (1–7).",
        ],
        "examples": ["PET bottles", "HDPE containers", "plastic bags", "wrappers"],
        "do_not": ["Don't put greasy or food-soiled plastic in recycling."],
        "fun_fact": "Recycling one plastic bottle saves enough energy to power a 60W light bulb for 6 hours!",
    },

    "paper": {
        "label": "Paper / Cardboard",
        "bin_color": "blue",
        "bin_emoji": "🔵",
        "recyclable": True,
        "reward_points": 8,
        "instructions": [
            "Flatten cardboard boxes before placing in bin.",
            "Keep paper dry — wet paper is not recyclable.",
            "Remove any plastic windows from envelopes.",
            "Shred confidential documents before recycling.",
        ],
        "examples": ["Newspapers", "magazines", "cardboard boxes", "office paper", "envelopes"],
        "do_not": ["Avoid recycling pizza boxes with grease stains."],
        "fun_fact": "One tonne of recycled paper saves 17 trees and 26,000 litres of water!",
    },

    "glass": {
        "label": "Glass",
        "bin_color": "green",
        "bin_emoji": "🟢",
        "recyclable": True,
        "reward_points": 12,
        "instructions": [
            "Rinse jars and bottles thoroughly.",
            "Remove metal lids and caps.",
            "Separate by color if your municipality requires it.",
            "Do not break glass — handle carefully.",
        ],
        "examples": ["Glass bottles", "jars", "containers"],
        "do_not": [
            "Don't put mirrors, windows, or drinking glasses in recycling — different composition.",
            "Never put broken glass in recycling bins.",
        ],
        "fun_fact": "Glass can be recycled endlessly without any loss in quality!",
    },

    "metal": {
        "label": "Metal",
        "bin_color": "grey",
        "bin_emoji": "⚫",
        "recyclable": True,
        "reward_points": 15,
        "instructions": [
            "Rinse cans before disposal.",
            "Crush aluminium cans to save space.",
            "Separate aluminium from steel if required.",
            "Tin foil can be recycled — scrunch into a ball first.",
        ],
        "examples": ["Aluminium cans", "steel tins", "foil trays", "bottle caps"],
        "do_not": ["Avoid putting aerosol cans that still contain product."],
        "fun_fact": "Recycling one aluminium can saves enough energy to run a TV for 3 hours!",
    },

    "organic": {
        "label": "Organic / Food Waste",
        "bin_color": "brown",
        "bin_emoji": "🟤",
        "recyclable": False,  # composted, not recycled
        "reward_points": 5,
        "instructions": [
            "Collect in a compostable bag or biodegradable liner.",
            "Include fruit/veg peels, tea bags, coffee grounds.",
            "Keep separate from dry recyclables.",
            "Consider home composting for garden waste.",
        ],
        "examples": ["Food scraps", "fruit peels", "vegetable waste", "garden leaves", "eggshells"],
        "do_not": [
            "Don't include meat, fish, or dairy in home compost (attracts pests).",
            "Avoid cooked food unless using a sealed compost bin.",
        ],
        "fun_fact": "Composting food waste reduces methane emissions from landfills by up to 50%!",
    },

    "e-waste": {
        "label": "E-Waste / Electronic Waste",
        "bin_color": "red",
        "bin_emoji": "🔴",
        "recyclable": True,
        "reward_points": 25,  # highest reward — hardest to dispose properly
        "instructions": [
            "Never throw electronics in regular bins.",
            "Remove batteries before disposal.",
            "Find a certified e-waste collection point near you.",
            "Wipe personal data from devices before disposal.",
        ],
        "examples": ["Batteries", "mobile phones", "chargers", "cables", "laptops", "small appliances"],
        "do_not": [
            "Never burn electronic waste — releases toxic fumes.",
            "Don't dismantle unless certified to do so.",
        ],
        "fun_fact": "E-waste is the fastest-growing waste stream globally — proper recycling recovers gold, silver, and rare earth metals!",
    },
}


# Quick lookup
CLASS_NAMES = list(WASTE_GUIDANCE.keys())
CLASS_TO_IDX = {cls: i for i, cls in enumerate(CLASS_NAMES)}
IDX_TO_CLASS = {i: cls for cls, i in CLASS_TO_IDX.items()}


def get_guidance(class_name: str) -> dict:
    """Return full guidance dict for a predicted class."""
    return WASTE_GUIDANCE.get(class_name, {})
