/**
 * trackEvent — fire-and-forget analytics event to backend.
 * Safe to call even when the user is not authenticated (fails silently).
 */
import api from '../services/api';

export function trackEvent(eventType, resourceId = null, resourceType = null, extra = null) {
    api.post('/analytics/track', {
        event_type: eventType,
        resource_id: resourceId ? String(resourceId) : null,
        resource_type: resourceType,
        extra,
    }).catch(() => {}); // intentionally silent
}
