from apscheduler.schedulers.background import BackgroundScheduler

_scheduler = None


def start_scheduler(app):
    global _scheduler
    if _scheduler or app.testing or not app.config.get('SCHEDULER_ENABLED'):
        return _scheduler
    from .reminders import safe_process
    _scheduler = BackgroundScheduler(timezone='UTC', daemon=True)
    _scheduler.add_job(safe_process, 'interval', minutes=1, args=[app], id='medtrack-reminders',
                       max_instances=1, coalesce=True, replace_existing=True)
    _scheduler.start()
    return _scheduler
