import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | import('rxjs').Observable<boolean> | Promise<boolean>;
}

export const preventUnsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate,
) => {
  if (component.canDeactivate) {
    return component.canDeactivate();
  }
  return true;
};
