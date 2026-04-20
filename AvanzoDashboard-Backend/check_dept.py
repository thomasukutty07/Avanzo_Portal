from accounts.models import Employee
from accounts.serializers import EmployeeSerializer

e = Employee.objects.filter(department__name='Technical Engineering').first()
if e:
    print('Tech employee:', e.get_full_name())
    print('  model department:', e.department)
    print('  model department_id:', e.department_id)
    s = EmployeeSerializer(e)
    data = s.data
    print('  serialized department:', data.get('department'))
    print('  serialized department_name:', data.get('department_name'))
else:
    print('No tech employee found')

# Also check the /me endpoint fields for Team Lead
tl = Employee.objects.filter(access_role__name='Team Lead', department__name='Technical Engineering').first()
if tl:
    print('\nTech Team Lead:', tl.get_full_name())
    stl = EmployeeSerializer(tl)
    d = stl.data
    print('  serialized department:', d.get('department'))
    print('  serialized department_name:', d.get('department_name'))
