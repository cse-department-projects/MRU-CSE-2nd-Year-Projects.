from flask import jsonify


def ok(data=None, status=200):
    return jsonify(success=True, data=data or {}, error=None), status


def fail(code, message, status, fields=None):
    error = {'code': code, 'message': message}
    if fields:
        error['fields'] = fields
    return jsonify(success=False, data={}, error=error), status
