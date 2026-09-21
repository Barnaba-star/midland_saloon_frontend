import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader-service';


@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './loader.html',
  styleUrls: ['./loader.css']
})
export class LoaderComponent implements OnInit {

  loading = false;


  constructor(
    private loaderService: LoaderService
  ){}


  ngOnInit(){

    this.loaderService.loaderState$
    .subscribe(state => {

      this.loading = state;

    });

  }

}
