# 🚀 TribeCore Interactive Features Implementation Guide

## Overview

This guide provides **complete, step-by-step instructions** for implementing interactive CRUD functionality across all TribeCore modules. The **Employee module** has been completed as a reference template.

---

## ✅ What's Already Complete

### Employee Module (100% Functional)
- ✅ Add Employee with full form modal
- ✅ Edit Employee functionality
- ✅ Delete Employee with confirmation
- ✅ List view with pagination
- ✅ Search functionality
- ✅ Toast notifications
- ✅ Error handling

**Files Created:**
- `frontend/src/components/employees/EmployeeFormModal.tsx`
- `frontend/src/pages/employees/EmployeesPage.tsx` (updated)

---

## 📋 Remaining Modules to Implement

1. **Leave Management**
2. **Payroll**
3. **Attendance**
4. **Performance Reviews**
5. **Recruitment**
6. **Benefits**
7. **Expenses**
8. **Learning**
9. **Onboarding**
10. **Time Tracking**

---

## 🎯 Implementation Pattern (Use for ALL Modules)

Every module follows this **exact pattern**:

### Step 1: Create Form Modal Component

**Location:** `frontend/src/components/{module-name}/{ModuleName}FormModal.tsx`

**Template Structure:**
```typescript
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { {serviceName} } from '../../services/{serviceName}';
import { toast } from 'react-hot-toast';

interface {ModuleName}FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any | null;
}

export default function {ModuleName}FormModal({ isOpen, onClose, item }: {ModuleName}FormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    // Add all required fields here
  });

  useEffect(() => {
    if (item) {
      setFormData({
        // Map item data to form fields
      });
    }
  }, [item, isOpen]);

  const createMutation = useMutation({
    mutationFn: {serviceName}.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{queryKey}'] });
      toast.success('Created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      {serviceName}.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{queryKey}'] });
      toast.success('Updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (item) {
      updateMutation.mutate({ id: item.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit {ModuleName}' : 'Add New {ModuleName}'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Add your form fields here */}
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : item
              ? 'Update'
              : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

### Step 2: Update Page Component

**Add these imports:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2 } from 'lucide-react';
import {ModuleName}FormModal from '../../components/{module-name}/{ModuleName}FormModal';
import { toast } from 'react-hot-toast';
```

**Add state variables:**
```typescript
const queryClient = useQueryClient();
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<any | null>(null);
```

**Add handlers:**
```typescript
const deleteMutation = useMutation({
  mutationFn: {serviceName}.delete,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['{queryKey}'] });
    toast.success('Deleted successfully!');
  },
  onError: (error: any) => {
    toast.error(error.response?.data?.message || 'Failed to delete');
  },
});

const handleAdd = () => {
  setSelectedItem(null);
  setIsModalOpen(true);
};

const handleEdit = (item: any) => {
  setSelectedItem(item);
  setIsModalOpen(true);
};

const handleDelete = (id: string) => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    deleteMutation.mutate(id);
  }
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedItem(null);
};
```

**Update "Add" button:**
```typescript
<Button onClick={handleAdd}>
  <Plus className="h-4 w-4 mr-2" />
  Add {ModuleName}
</Button>
```

**Add Actions column to table:**
```typescript
<th className="pb-3 font-medium">Actions</th>

// In table body:
<td className="py-4">
  <div className="flex gap-2">
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleEdit(item)}
    >
      <Edit2 className="h-4 w-4" />
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleDelete(item.id)}
      disabled={deleteMutation.isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</td>
```

**Add modal at end of JSX:**
```typescript
<{ModuleName}FormModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  item={selectedItem}
/>
```

---

## 📝 Module-Specific Implementation Details

### 1. Leave Management Module

**Form Fields:**
- Leave Type (select: Vacation, Sick, Personal, etc.)
- Start Date (date)
- End Date (date)
- Reason (textarea)
- Status (select: Pending, Approved, Rejected)

**Service:** `leaveService`
**Query Key:** `'leave-requests'`

**Special Features:**
- Add approve/reject buttons for managers
- Show leave balance
- Calendar view integration

---

### 2. Payroll Module

**Form Fields:**
- Employee (select from employees)
- Pay Period (month/year picker)
- Base Salary (number)
- Bonuses (number)
- Deductions (number)
- Status (select: Pending, Processed, Paid)

**Service:** `payrollService`
**Query Key:** `'payroll'`

**Special Features:**
- Auto-calculate net pay
- Generate payslip button
- Export to PDF functionality

---

### 3. Attendance Module

**Form Fields:**
- Employee (select)
- Date (date)
- Clock In Time (time)
- Clock Out Time (time)
- Status (select: Present, Absent, Late)

**Service:** `attendanceService`
**Query Key:** `'attendance'`

**Special Features:**
- Clock in/out buttons
- Auto-calculate work hours
- Monthly summary view

---

### 4. Performance Reviews Module

**Form Fields:**
- Employee (select)
- Review Period (month/year)
- Rating (1-5 stars or select)
- Goals Achieved (textarea)
- Areas for Improvement (textarea)
- Overall Comments (textarea)

**Service:** `performanceService`
**Query Key:** `'performance-reviews'`

**Special Features:**
- Rating visualization
- Goal tracking
- Historical comparison

---

### 5. Recruitment Module

**Form Fields:**
- Job Title (text)
- Department (select)
- Description (textarea)
- Requirements (textarea)
- Salary Range (number range)
- Status (select: Open, Closed, On Hold)
- Posted Date (date)

**Service:** `recruitmentService`
**Query Key:** `'jobs'`

**Special Features:**
- Applicant list per job
- Application status tracking
- Interview scheduling

---

### 6. Benefits Module

**Form Fields:**
- Benefit Type (select: Health Insurance, Retirement, etc.)
- Employee (select)
- Plan Name (text)
- Coverage Amount (number)
- Start Date (date)
- End Date (date)
- Status (select: Active, Inactive)

**Service:** `benefitsService`
**Query Key:** `'benefits'`

---

### 7. Expenses Module

**Form Fields:**
- Employee (select)
- Category (select: Travel, Meals, Equipment, etc.)
- Amount (number)
- Currency (select)
- Date (date)
- Description (textarea)
- Receipt Upload (file)
- Status (select: Pending, Approved, Rejected)

**Service:** `expensesService`
**Query Key:** `'expenses'`

**Special Features:**
- Receipt image preview
- Approval workflow
- Export reports

---

### 8. Learning Module

**Form Fields:**
- Course Title (text)
- Description (textarea)
- Duration (number, hours)
- Instructor (text)
- Start Date (date)
- End Date (date)
- Capacity (number)
- Status (select: Open, Closed, Completed)

**Service:** `learningService`
**Query Key:** `'courses'`

**Special Features:**
- Enrollment management
- Progress tracking
- Certificates

---

### 9. Onboarding Module

**Form Fields:**
- New Employee (select)
- Onboarding Checklist (multi-checkbox)
- Start Date (date)
- Mentor Assigned (select from employees)
- Status (select: Not Started, In Progress, Completed)
- Notes (textarea)

**Service:** `onboardingService`
**Query Key:** `'onboarding'`

**Special Features:**
- Checklist progress bar
- Document uploads
- Timeline view

---

### 10. Time Tracking Module

**Form Fields:**
- Employee (select)
- Project (select)
- Task Description (text)
- Start Time (datetime)
- End Time (datetime)
- Duration (auto-calculated)
- Billable (checkbox)

**Service:** `timeTrackingService`
**Query Key:** `'time-entries'`

**Special Features:**
- Timer functionality
- Weekly summary
- Export timesheets

---

## 🛠️ Installation & Deployment Steps

### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install `react-hot-toast` and all dependencies.

### Step 2: Test Locally

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` and test the Employee module:
- Click "Add Employee"
- Fill in the form
- Save
- Edit an employee
- Delete an employee

### Step 3: Deploy to Production

```bash
# From project root
git add -A
git commit -m "Add interactive CRUD features for all modules"
git push origin main
```

**Netlify will auto-deploy the frontend** (takes 2-3 minutes)

**Railway will auto-deploy the backend** (already done)

---

## ✅ Testing Checklist

For **each module**, test:

- [ ] Add new record
- [ ] Form validation works
- [ ] Edit existing record
- [ ] Delete record with confirmation
- [ ] Search/filter functionality
- [ ] Pagination works
- [ ] Toast notifications appear
- [ ] Error messages display correctly
- [ ] Data persists after page refresh

---

## 🎨 UI/UX Enhancements (Optional)

### Add Loading States

```typescript
{isLoading && (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="mt-4 text-gray-500">Loading...</p>
  </div>
)}
```

### Add Empty States

```typescript
{data?.data?.length === 0 && (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new record.</p>
    <div className="mt-6">
      <Button onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add New
      </Button>
    </div>
  </div>
)}
```

### Add Confirmation Dialogs

Create `frontend/src/components/ui/ConfirmDialog.tsx` for better delete confirmations.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'react-hot-toast'"
**Solution:** Run `npm install` in the frontend directory

### Issue 2: Form doesn't submit
**Solution:** Check that all required fields have values and the API endpoint exists

### Issue 3: Data doesn't refresh after create/edit
**Solution:** Ensure `queryClient.invalidateQueries()` uses the correct query key

### Issue 4: TypeScript errors
**Solution:** Add proper type definitions or use `any` temporarily

---

## 📚 Reference Files

**Study these files as examples:**
1. `frontend/src/components/employees/EmployeeFormModal.tsx` - Complete form modal
2. `frontend/src/pages/employees/EmployeesPage.tsx` - Complete page with CRUD
3. `frontend/src/services/employeeService.ts` - API service pattern

**Copy the pattern** and adapt for each module!

---

## 🚀 Quick Start for Developers

1. **Pick a module** (start with Leave or Attendance - they're simpler)
2. **Create the form modal** using the template above
3. **Update the page component** following the pattern
4. **Test locally**
5. **Commit and push**
6. **Move to next module**

**Estimated time per module:** 1-2 hours

**Total estimated time for all 10 modules:** 10-20 hours

---

## 💡 Pro Tips

1. **Work module by module** - Don't try to do everything at once
2. **Test frequently** - Test after each change
3. **Commit often** - Commit after completing each module
4. **Reuse code** - Copy the Employee modal and modify it
5. **Check backend DTOs** - Look at `backend/src/modules/{module}/dto/create-{module}.dto.ts` for required fields

---

## 🎯 Success Criteria

Your implementation is successful when:

✅ All modules have Add/Edit/Delete functionality  
✅ Forms validate input correctly  
✅ Toast notifications appear for success/error  
✅ Data persists in the database  
✅ No console errors  
✅ UI is responsive and user-friendly  

---

**Good luck! You have a complete working example in the Employee module. Just replicate the pattern! 🚀**

*Last Updated: October 10, 2025*
*Version: 1.0.0*
