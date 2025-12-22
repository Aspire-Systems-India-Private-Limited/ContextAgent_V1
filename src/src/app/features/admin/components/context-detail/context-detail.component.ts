import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextService, Context } from '../../../../core/services/context.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-context-detail',
  templateUrl: './context-detail.component.html',
  styleUrls: ['./context-detail.component.scss']
})
export class ContextDetailComponent implements OnInit {
  context?: Context;
  loading: boolean = false;
  showHistory: boolean = false;
  loadingHistory: boolean = false;
  history: Context[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contextService: ContextService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContext(id);
    }
  }

  loadContext(id: string): void {
    this.loading = true;
    this.contextService.getContextById(id).subscribe({
      next: (context: Context) => {
        this.context = context;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading context:', error);
        this.toastr.error('Failed to load context details', 'Error');
        this.loading = false;
        this.router.navigate(['/admin']);
      }
    });
  }

  toggleHistory(): void {
    if (!this.showHistory && this.context && !this.history.length) {
      this.loadHistory();
    }
    this.showHistory = !this.showHistory;
  }

  loadHistory(): void {
    if (!this.context?.PromptCode) return;

    this.loadingHistory = true;
    this.contextService.getContextHistory(this.context.PromptCode).subscribe({
      next: (history: Context[]) => {
        this.history = history.sort((a, b) => {
          // Sort by ContextVersion descending (newest first)
          return (b.ContextVersion || '').localeCompare(a.ContextVersion || '');
        });
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.toastr.error('Failed to load version history', 'Error');
        this.loadingHistory = false;
      }
    });
  }

  editContext(): void {
    if (this.context?.id) {
      this.router.navigate(['/admin/context/edit', this.context.id]);
    }
  }

  deleteContext(): void {
    if (!this.context?.id) return;

    if (confirm(`Are you sure you want to delete context "${this.context.PromptCode}"?`)) {
      this.contextService.deleteContext(this.context.id).subscribe({
        next: () => {
          this.toastr.success('Context deleted successfully', 'Success');
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          console.error('Error deleting context:', error);
          this.toastr.error('Failed to delete context', 'Error');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success('Copied to clipboard', 'Success');
    }).catch(() => {
      this.toastr.error('Failed to copy', 'Error');
    });
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
