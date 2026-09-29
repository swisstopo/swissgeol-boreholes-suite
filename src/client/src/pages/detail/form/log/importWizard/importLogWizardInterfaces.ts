import { LogImportUploadState } from "../logInterfaces.ts";

/** The steps of the wizard, in the order they are walked and shown in. */
export enum ImportStep {
  Runs = 0,
  Files = 1,
  Report = 2,
}

export interface ImportLogWizardProps {
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
}

/** What the progress bar shows about the attachment currently on the wire. */
export interface UploadProgressState {
  fileName: string;
  current: number;
  count: number;
  transferred: number;
  total?: number;
}

/**
 * The progress the wizard holds, plus the way out of it.
 *
 * Extending the state the wizard keeps rather than restating its fields is what lets the wizard
 * hand the whole of it over in one spread without a field going missing on the way.
 */
export interface ImportUploadProgressProps extends UploadProgressState {
  onCancel: () => void;
}

/** What one attachment needs from the wizard run it belongs to. */
export interface AttachmentUploadContext {
  controller: AbortController;
  count: number;
  /** Whether the run this upload belongs to still owns the wizard. */
  ownsWizard: () => boolean;
  setUploadState: (logFileId: number, state: LogImportUploadState) => void;
  setProgress: (progress: UploadProgressState) => void;
}
