import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-error405',
    templateUrl: './error405.component.html',
    styleUrls: ['./error405.component.scss']
})
export class Error405Component {

    constructor(private router: Router) {}

    goHome() {
        this.router.navigate(['/home']);
    }
}
