import { Component,OnInit, AfterViewInit, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl, FormControlName} from '@angular/forms';
import {Http,Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { GenericValidator } from './shared/generic-validator';

import {AppService} from './app.service';
import {Building} from './building';


function emailMatcher(c: AbstractControl) {
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');

    if (emailControl.pristine || confirmControl.pristine) {
        return null;
    }

    if (emailControl.value === confirmControl.value) {
        return null;
    }
    return { 'match': true };
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
   providers: <any>[AppService]
})
export class AppComponent implements OnInit, AfterViewInit {
@ViewChildren(FormControlName, { read: ElementRef }) formControls: ElementRef[];
customerForm: FormGroup;
    displayMessage: { [key: string]: string } = {};
    genericValidator: GenericValidator;
  
  
  post:any;                     
  saveSuccess: boolean;
  private posts:Building[] = [];
  private errorMessage:any = '';
  welcome : string;
    
	
	private validationMessages: { [key: string]: { [key: string]: string } } = {
	
	 buildingid: {
            required: 'Please enter Building ID',
            
        },
        moveindate: {
            required: 'Please enter move in date',
            
        },
        street: {
            required: 'Please enter street.',
            maxlength: 'The street name must be less than 100 characters.',
        },
		postcode: {
            required: 'Please enter postcode.',
           
        },
		town: {
            required: 'Please enter Town name.',
			maxlength: 'The town name must be less than 100 characters.',
           
        },
		country: {
            required: 'Please enter country name.',
			maxlength: 'The country name must be less than 100 characters.',
           
        },
        email: {
            required: 'Please enter your email address.',
            pattern: 'Please enter a valid email address.'
        }
    };
	

  constructor(private fb: FormBuilder,private http: Http,private _postDataService:AppService) {
  this.getPosts();
  this.welcome = "Building List";

        
  
this.genericValidator = new GenericValidator(this.validationMessages);
    

  }

  ngOnInit() {
  this.customerForm = this.fb.group({
            buildingid: [null, [Validators.required]],
            moveindate: [null, [Validators.required]],
            street: [null, [Validators.required, Validators.maxLength(100)]],
			postcode: [null, [Validators.required]],
			town: [null, [Validators.required, Validators.maxLength(100)]],
			country: [null, [Validators.required, Validators.maxLength(100)]],
            emailGroup: this.fb.group({
                email: [null, [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail: [null, Validators.required]
            }, { validator: emailMatcher })
            
        });

        
    
  }
  ngAfterViewInit() {
        let controlBlurs: Observable<any>[] = this.formControls
            .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

        Observable.merge(this.customerForm.valueChanges, ...controlBlurs).debounceTime(1000).subscribe(value => {
            this.displayMessage = this.genericValidator.processMessages(this.customerForm);
        });
    }

  addPost(post) {
  console.log(post);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    const data = JSON.stringify(post);

   

   const req = this.http.post('http://www.fbpredictor.com/assets/task_backend/web/Buildings/insert',data)
   .map((data: Response) => data.json())
      .subscribe(
	  
        (data) => { 
            if (data){
			console.log(data);
                this.saveSuccess = true;
				setTimeout(function() {
                  this.saveSuccess = false;
				  window.location.reload();
				  
                
                 }.bind(this), 300);
				
				
            }
            else{
                this.saveSuccess = false;
            }
        }
      );
  
	
  }
  
  
  getPosts() {
        this._postDataService.getData()
            .subscribe(
                posts => this.posts = posts,
                error => this.errorMessage = <any>error);
    }
	

}
