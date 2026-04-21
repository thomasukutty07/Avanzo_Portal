from attendance.models import DailyLog
from accounts.models import Employee
from django.utils import timezone
users = Employee.objects.filter(email__in=['teamlead@avanzo.com', 'cyberlead@avanzo.com', 'tech@avanzo.com', 'cybersecurity@avanzo.com'])
today = timezone.now().date()
for u in users:
    log, created = DailyLog.objects.get_or_create(
        employee=u, 
        date=today, 
        defaults={
            'status': DailyLog.Status.CLOCKED_IN, 
            'clock_in_time': timezone.now(), 
            'tenant': u.tenant
        }
    )
    if not created:
        log.status = DailyLog.Status.CLOCKED_IN
        if not log.clock_in_time:
            log.clock_in_time = timezone.now()
        log.save()
print(f"Bypassed attendance for {users.count()} users.")
