import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface TableConfiguraton {
  priceInChf: boolean;
  normalizedPricePerUnit: boolean;
}

export const initialTableConfig = { priceInChf: true, normalizedPricePerUnit: true };

@Component({
  selector: 'app-table-configurator',
  templateUrl: './table-configurator.component.html',
  styleUrls: ['./table-configurator.component.scss'],
})
export class TableConfiguratorComponent implements OnInit {
  @Output() configChange: EventEmitter<TableConfiguraton> = new EventEmitter<
    TableConfiguraton
  >();

  priceInCHF = new FormControl(true);
  normalizedPricePerUnit = new FormControl(true);

  tableConfig: TableConfiguraton = initialTableConfig;

  constructor() {}

  ngOnInit(): void {
    this.priceInCHF.valueChanges.subscribe((newVal) => {
      this.tableConfig = { ...this.tableConfig, priceInChf: newVal };
      this.configChange.emit(this.tableConfig);
    });

    this.normalizedPricePerUnit.valueChanges.subscribe((newVal) => {
      this.tableConfig = { ...this.tableConfig, normalizedPricePerUnit: newVal };
      this.configChange.emit(this.tableConfig);
    });
  }
}
