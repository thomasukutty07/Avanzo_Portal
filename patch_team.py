with open(r'c:\Work\avanzo dashboard\Avanzo Frontend\src\pages\teamlead\Team.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    # After line index 275 (0-indexed), which is the closing </button> on line 276
    if i == 275:
        new_lines.append('\n')
        new_lines.append('              <button \n')
        new_lines.append('                onClick={() => openWorkDialog(member)}\n')
        new_lines.append('                className="w-full mt-2 py-3.5 bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold rounded-[1.2rem] hover:bg-violet-100 transition-all flex items-center justify-center gap-2.5 active:scale-95 group shadow-sm"\n')
        new_lines.append('              >\n')
        new_lines.append('                <ClipboardList className="size-3.5" />\n')
        new_lines.append('                View Assigned Work\n')
        new_lines.append('              </button>\n')
        print(f'Inserted after line {i+1}')

with open(r'c:\Work\avanzo dashboard\Avanzo Frontend\src\pages\teamlead\Team.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done. Total lines:', len(new_lines))
