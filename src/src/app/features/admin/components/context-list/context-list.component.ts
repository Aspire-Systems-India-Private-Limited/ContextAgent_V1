import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Context } from '../../../../core/services/context.service';

@Component({
  selector: 'app-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss']
})
export class ContextListComponent {
  @Input() contexts: Context[] = [];
  @Input() viewMode: 'list' | 'grid' | 'tree' = 'list';
  @Output() edit = new EventEmitter<Context>();
  @Output() delete = new EventEmitter<Context>();
  @Output() view = new EventEmitter<Context>();

  onEdit(context: Context): void {
    this.edit.emit(context);
  }

  onDelete(context: Context): void {
    if (confirm(`Are you sure you want to delete context "${context.PromptCode}"?`)) {
      this.delete.emit(context);
    }
  }

  onView(context: Context): void {
    this.view.emit(context);
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
