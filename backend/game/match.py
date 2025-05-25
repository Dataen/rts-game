def run_match(bot1: str, bot2: str) -> str:
    log = [f"{bot1} vs {bot2} match started"]
    for tick in range(10):
        log.append(f"Tick {tick}: Bots calculating moves...")
    log.append(f"{bot1} wins!")
    return "\n".join(log)