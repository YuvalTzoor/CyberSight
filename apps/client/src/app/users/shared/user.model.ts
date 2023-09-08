import { SafeUrl } from '@angular/platform-browser';
import { UserPayload } from '@final-project/shared';
import { Observable } from 'rxjs';

export interface User extends UserPayload {
  profileImage$?: Observable<SafeUrl>;
}
