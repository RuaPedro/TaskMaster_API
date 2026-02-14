import { StudyTopic} from './study_topic.model.js'

export class StudyBlock
{
   constructor(params)
   {
    this.id = params?.id ?? null;
    this.topic = params?.topic
        ? (typeof params.topic === 'object' ? new StudyTopic(params.topic) : params.topic)
        : null;
    this.number = params?.number || '';
    this.title = params?.title || '';
    this.description = params?.description || '';
    this.estimated_minutes = params?.estimated_minutes || '';
    this.is_published = params?.is_published || false;
    this.created_at = params?.created_at || '';
    this.updated_at = params?.updated_at || '';
   } 
}
