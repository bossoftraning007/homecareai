-- Verify notification tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences', 'broadcast_log', 'push_subscriptions');

-- Test: Insert a sample notification for yourself
INSERT INTO notifications (user_id, type, title, body, icon, action_url, priority)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID from profiles
  'broadcast',
  'Welcome to HomeCare AI!',
  'Your notification system is now active. You will receive updates here.',
  'B',
  '/notifications',
  'normal'
);

-- Verify the notification was created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
