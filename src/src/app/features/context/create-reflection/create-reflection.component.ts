import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-reflection',
  templateUrl: './create-reflection.component.html',
  styleUrls: ['./create-reflection.component.scss']
})
export class CreateReflectionComponent implements OnInit {
  reflectionForm!: FormGroup;
  saving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.reflectionForm = this.fb.group({
      agentCode: ['', Validators.required],
      reflect: ['', Validators.required],
      reason: [''],
      filters: this.fb.array([]),
      content: ['', Validators.required]
    });
    
    // Add initial filter row
    this.addFilter();
  }

  get filters(): FormArray {
    return this.reflectionForm.get('filters') as FormArray;
  }

  addFilter(): void {
    const filterGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.filters.push(filterGroup);
  }

  removeFilter(index: number): void {
    if (this.filters.length > 1) {
      this.filters.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.reflectionForm.invalid) {
      Object.keys(this.reflectionForm.controls).forEach(key => {
        this.reflectionForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.saving = true;

    // Convert filters array to object
    const filtersObj: Record<string, any> = {};
    this.filters.value.forEach((item: any) => {
      if (item.key && item.value) {
        filtersObj[item.key] = item.value;
      }
    });

    const reflectionData = {
      agent_code: this.reflectionForm.value.agentCode,
      reflect: this.reflectionForm.value.reflect,
      reason: this.reflectionForm.value.reason,
      filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
      content: this.reflectionForm.value.content,
      created_at: new Date().toISOString()
    };

    console.log('Creating reflection context:', reflectionData);

    // Simulate API call
    setTimeout(() => {
      this.toastr.success('Reflection context created successfully', 'Success');
      this.resetForm();
      this.saving = false;
    }, 1000);
  }

  resetForm(): void {
    this.reflectionForm.reset();
    this.filters.clear();
    this.addFilter();
  }
}
