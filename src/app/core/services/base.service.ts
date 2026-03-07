// src/app/core/services/base.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BaseService {

    protected getHeaders(): { headers: HttpHeaders } {
        const token = localStorage.getItem('jwt_token');
        return {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token || ''}`,
                'Content-Type': 'application/json'
            })
        };
    }
}