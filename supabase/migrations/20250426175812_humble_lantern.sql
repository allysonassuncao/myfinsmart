/*
  # Notifications System Setup

  1. New Tables
    - `notifications`
      - `notification_id` (uuid, primary key): Unique identifier for each notification
      - `user_id` (uuid): Reference to the user this notification belongs to
      - `title` (text): Notification title
      - `message` (text): Notification message content
      - `type` (text): Type of notification (email, web, both)
      - `schedule_time` (timestamptz): When the notification should be sent
      - `repeat_interval` (text): How often to repeat (daily, weekly, monthly, none)
      - `status` (text): Current status (pending, sent, failed)
      - `created_at` (timestamptz): When the notification was created
      - `updated_at` (timestamptz): Last update timestamp
      - `is_read` (boolean): Whether the notification has been read by the user
      
  2. Security
    - Enable RLS on notifications table
    - Add policies for authenticated users
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'web', 'both')),
  schedule_time timestamptz NOT NULL,
  repeat_interval text NOT NULL DEFAULT 'none' CHECK (repeat_interval IN ('none', 'daily', 'weekly', 'monthly')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE
  ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();