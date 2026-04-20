from projects.models import Task

print('All tasks in system:')
for t in Task.objects.all().select_related('assignee', 'project', 'project__owning_department'):
    print(f'  [{t.id}]')
    print(f'    Title: {t.title}')
    print(f'    Assignee: {t.assignee.get_full_name()} (id={t.assignee.id})')
    print(f'    Project: {t.project.title}')
    print(f'    Project dept: {t.project.owning_department}')
    print(f'    Status: {t.status}')
    print()
