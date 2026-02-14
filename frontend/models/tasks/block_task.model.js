import { StudyBlock } from './study_block.model.js'

export class BlockTask
{
    constructor(params)
    {
       this.id = params?.id ?? null;
       this.block = params?.block
            ? (typeof params.block === 'object' ? new StudyBlock(params.block) : params.block)
            : null;
       this.block_detail = params?.block_detail ? new StudyBlock(params.block_detail) : null;
       this.title = params?.title || '';
       this.instructions = params?.instructions || '';
       this.resources = params?.resources || '';
       this.estimated_minutes = params?.estimated_minutes || '';
       this.order = params?.order || '';
       this.status = params?.status || '';
       this.created_at = params?.created_at || '';
       this.updated_at = params?.updated_at|| ''; 
    }
}
