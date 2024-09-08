import { Component, OnInit } from '@angular/core';

interface WeightOption {
  size: string;
  price: string;
}

interface Product {
  img: string;
  title: string;
  description: string;
  weights: WeightOption[];
  selectedWeight: WeightOption | null;
}

@Component({
  selector: 'app-gato',
  templateUrl: './gato.page.html',
  styleUrls: ['./gato.page.scss'],
})

}
