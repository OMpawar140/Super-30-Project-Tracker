-- 1. Function to update milestone status based on tasks
CREATE OR REPLACE FUNCTION update_milestone_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update milestone status based on task completion
    UPDATE milestones 
    SET status = CASE
        -- All tasks completed
        WHEN (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE milestone_id = COALESCE(NEW.milestone_id, OLD.milestone_id)
            AND status != 'COMPLETED'
        ) = 0 AND (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE milestone_id = COALESCE(NEW.milestone_id, OLD.milestone_id)
        ) > 0 THEN 'COMPLETED'
        
        -- Any task in progress
        WHEN (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE milestone_id = COALESCE(NEW.milestone_id, OLD.milestone_id)
            AND status = 'IN_PROGRESS'
        ) > 0 THEN 'IN_PROGRESS'
        
        -- Check for overdue tasks
        WHEN (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE milestone_id = COALESCE(NEW.milestone_id, OLD.milestone_id)
            AND status NOT IN ('COMPLETED')
            AND due_date < NOW()
        ) > 0 THEN 'OVERDUE'
        
        ELSE status
    END,
    updated_at = NOW()
    WHERE id = COALESCE(NEW.milestone_id, OLD.milestone_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Function to update project status based on milestones
CREATE OR REPLACE FUNCTION update_project_status()
RETURNS TRIGGER AS $$
DECLARE
    project_id_val VARCHAR;
BEGIN
    -- Get project ID from milestone
    SELECT project_id INTO project_id_val
    FROM milestones 
    WHERE id = COALESCE(NEW.id, OLD.id);
    
    -- Update project status
    UPDATE projects 
    SET status = CASE
        -- All milestones completed
        WHEN (
            SELECT COUNT(*) 
            FROM milestones 
            WHERE project_id = project_id_val
            AND status != 'COMPLETED'
        ) = 0 AND (
            SELECT COUNT(*) 
            FROM milestones 
            WHERE project_id = project_id_val
        ) > 0 THEN 'COMPLETED'
        
        -- Any milestone in progress
        WHEN (
            SELECT COUNT(*) 
            FROM milestones 
            WHERE project_id = project_id_val
            AND status = 'IN_PROGRESS'
        ) > 0 THEN 'ACTIVE'
        
        ELSE status
    END,
    updated_at = NOW()
    WHERE id = project_id_val;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Function to handle date-based status updates
CREATE OR REPLACE FUNCTION update_date_based_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update task status based on dates
    IF NEW.start_date <= NOW() AND NEW.status = 'UPCOMING' THEN
        NEW.status = 'IN_PROGRESS';
    END IF;
    
    -- Check for overdue
    IF NEW.due_date < NOW() AND NEW.status NOT IN ('COMPLETED', 'IN_REVIEW') THEN
        NEW.status = 'OVERDUE';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Function for milestone date-based updates
CREATE OR REPLACE FUNCTION update_milestone_date_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update milestone status based on dates
    IF NEW.start_date <= NOW() AND NEW.status = 'PLANNED' THEN
        NEW.status = 'IN_PROGRESS';
    END IF;
    
    -- Check for overdue milestones
    IF NEW.end_date < NOW() AND NEW.status NOT IN ('COMPLETED') THEN
        NEW.status = 'OVERDUE';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers for tasks
CREATE TRIGGER task_status_update_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_date_based_status();

CREATE TRIGGER task_milestone_status_trigger
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_status();

CREATE TRIGGER task_insert_milestone_status_trigger
    AFTER INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_status();

CREATE TRIGGER task_delete_milestone_status_trigger
    AFTER DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_status();

-- 6. Create triggers for milestones
CREATE TRIGGER milestone_status_update_trigger
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_date_status();

CREATE TRIGGER milestone_project_status_trigger
    AFTER UPDATE OF status ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_project_status();

-- 7. Scheduled function to check all overdue items (run via cron)
CREATE OR REPLACE FUNCTION check_overdue_items()
RETURNS void AS $$
BEGIN
    -- Update overdue tasks
    UPDATE tasks 
    SET status = 'OVERDUE', updated_at = NOW()
    WHERE due_date < NOW() 
    AND status NOT IN ('COMPLETED', 'IN_REVIEW', 'OVERDUE');
    
    -- Update overdue milestones
    UPDATE milestones 
    SET status = 'OVERDUE', updated_at = NOW()
    WHERE end_date < NOW() 
    AND status NOT IN ('COMPLETED', 'OVERDUE');
    
    -- Trigger cascade updates
    PERFORM update_milestone_status() FROM tasks WHERE status = 'OVERDUE';
    PERFORM update_project_status() FROM milestones WHERE status = 'OVERDUE';
END;
$$ LANGUAGE plpgsql;