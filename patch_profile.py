with open(r'c:\Work\avanzo dashboard\Avanzo Frontend\src\pages\shared\EmployeeProfile.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
inserted = False
for i, line in enumerate(lines):
    new_lines.append(line)
    # After line index 337 (line 338), which ends the activity TabsContent
    if i == 337 and not inserted:
        new_lines.append('\n')
        new_lines.append('                       <TabsContent value="assigned_work" className="m-0">\n')
        new_lines.append('                          <AssignedWorkTab employeeId={id!} employeeName={`${employee.first_name} ${employee.last_name}`} />\n')
        new_lines.append('                       </TabsContent>\n')
        inserted = True
        print(f'Inserted after line {i+1}')

with open(r'c:\Work\avanzo dashboard\Avanzo Frontend\src\pages\shared\EmployeeProfile.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done. Total lines:', len(new_lines))
