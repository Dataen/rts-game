from schema.bot_language import BotLanguage

def file_extension(lang: BotLanguage) -> str:
    if lang == BotLanguage.python:
        return 'py'
    elif lang == BotLanguage.typescript:
        return 'ts'
    elif lang == BotLanguage.cpp:
        return 'cpp'
    return 'txt'