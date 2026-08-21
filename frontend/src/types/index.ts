export interface Project {
  id: string;
  title: string;
  description?: string;
  channel_name?: string;
  view_count: number;
  show_author: boolean;
  status: 'draft' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  panels?: Panel[];
}

export interface Panel {
  id: string;
  project_id: string;
  order_index: number;
  script: string;
  image_url?: string | null;
  audio_url?: string | null;
  voice_id:
    | 'Zephyr'
    | 'Puck'
    | 'Charon'
    | 'Kore'
    | 'Fenrir'
    | 'Leda'
    | 'Orus'
    | 'Aoede'
    | 'Callirrhoe'
    | 'Autonoe'
    | 'Enceladus'
    | 'Iapetus'
    | 'Umbriel'
    | 'Algieba'
    | 'Despina'
    | 'Erinome'
    | 'Algenib'
    | 'Rasalgethi'
    | 'Laomedeia'
    | 'Achernar'
    | 'Alnilam'
    | 'Schedar'
    | 'Gacrux'
    | 'Pulcherrima'
    | 'Achird'
    | 'Zubenelgenubi'
    | 'Vindemiatrix'
    | 'Sadachbia'
    | 'Sadaltager'
    | 'Sulafat';
  voice_speed: number;
  text_size: number;
  text_color: string;
  background_color: string;
  image_status: 'empty' | 'uploading' | 'ready' | 'failed';
  image_error?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  image_file_size?: number | null;
  tts_status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  tts_model?: string | null;
  tts_hash?: string | null;
  tts_instructions?: string | null;
  tts_error?: string | null;
  audio_duration_ms?: number | null;
  audio_file_size?: number | null;
  render_ready: boolean;
  subtitle_position: 'top' | 'middle' | 'bottom';
  transition_type: 'none' | 'fade';
  transition_duration_ms: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDTO {
  title: string;
  description?: string;
  channel_name?: string;
  view_count?: number;
  show_author?: boolean;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  channel_name?: string;
  view_count?: number;
  show_author?: boolean;
  status?: 'draft' | 'in_progress' | 'completed';
}

export interface CreatePanelDTO {
  project_id: string;
  script: string;
  voice_id?: Panel['voice_id'];
  voice_speed?: number;
  text_size?: number;
  text_color?: string;
  background_color?: string;
  order_index?: number;
  subtitle_position?: Panel['subtitle_position'];
  transition_type?: Panel['transition_type'];
  transition_duration_ms?: number;
}

export interface UpdatePanelDTO {
  script?: string;
  voice_id?: Panel['voice_id'];
  voice_speed?: number;
  text_size?: number;
  text_color?: string;
  background_color?: string;
  tts_instructions?: string | null;
  subtitle_position?: Panel['subtitle_position'];
  transition_type?: Panel['transition_type'];
  transition_duration_ms?: number;
}

export interface ReorderPanelDTO {
  id: string;
  order_index: number;
}

export interface RenderJob {
  id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  output_url?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TtsBatchResult {
  panels: Panel[];
  errors: Array<{
    panel_id: string;
    message: string;
    statusCode: number;
  }>;
}

