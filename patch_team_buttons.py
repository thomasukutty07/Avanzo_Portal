with open(r'c:\Work\avanzo dashboard\Avanzo Frontend\src\pages\teamlead\Team.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 273-291 (0-indexed 272-290) - the two buttons - with one navigate button
new_button = [
    '\n',
    '              <button\n',
    '                onClick={() => navigate(`/team/${member.id}`)}\n',
    '                className="w-full py-3.5 bg-violet-600 text-white text-[10px] font-bold rounded-[1.2rem] hover:bg-violet-700 transition-all flex items-center justify-center gap-2.5 active:scale-95 group shadow-lg shadow-violet-600/20"\n',
    '              >\n',
    '                View Full Profile\n',
    '                <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />\n',
    '              </button>\n',
]

new_lines = lines[:272] + new_button + lines[291:]

with open(r'c:\Work\avanzo dashboard\Avanzo Frontend\src\pages\teamlead\Team.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done. Total lines:', len(new_lines))
