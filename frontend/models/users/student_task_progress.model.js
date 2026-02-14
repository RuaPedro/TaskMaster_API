import { Student } from "./student.model.js";
import { BlockTask } from "../tasks/block_task.model.js";

export class StudentTaskProgress
{
    constructor(params)
    {
        this.id = params?.id ?? null;
        this.student = params?.student
            ? (typeof params.student === 'object' ? new Student(params.student) : params.student)
            : null;
        this.task = params?.task
            ? (typeof params.task === 'object' ? new BlockTask(params.task) : params.task)
            : null;
        this.task_detail = params?.task_detail ? new BlockTask(params.task_detail) : null;
        this.status = params?.status || 'pending';
        this.started_at = params?.started_at || '';
        this.completed_at = params?.completed_at || '';
        this.notes = params?.notes || '';
    }
}
