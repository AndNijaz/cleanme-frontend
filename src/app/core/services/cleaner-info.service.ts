import { Injectable, TemplateRef, ViewChild } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CleanerInfoService {
  activeStep = 1;

  @ViewChild('selectServices', { static: true })
  selectServicesTemplate!: TemplateRef<any>;
  @ViewChild('describeServices', { static: true })
  describeServicesTemplate!: TemplateRef<any>;
  @ViewChild('setAvailability', { static: true })
  setAvailabilityTemplate!: TemplateRef<any>;
  @ViewChild('contactDetails', { static: true })
  contactDetailsTemplate!: TemplateRef<any>;

  steps: {
    value: number;
    title: string;
    subtitle: string;
    panelTemplate: TemplateRef<any>;
  }[] = [];

  constructor(public cleanerInfoService: CleanerInfoService) {}

  ngAfterViewInit() {
    this.steps = [
      {
        value: 1,
        title: 'Choose Services',
        subtitle: 'Choose up to 4 cleaning services you offer.',
        panelTemplate: this.selectServicesTemplate,
      },
      {
        value: 2,
        title: 'Describe Services',
        subtitle: 'Describe what each selected service includes.',
        panelTemplate: this.describeServicesTemplate,
      },
      {
        value: 3,
        title: 'Set Availability',
        subtitle: 'Set your available working hours.',
        panelTemplate: this.setAvailabilityTemplate,
      },
      {
        value: 4,
        title: 'Contact Details',
        subtitle: 'Provide your contact details and pricing.',
        panelTemplate: this.contactDetailsTemplate,
      },
    ];
  }

  private selectedServices: string[] = [];
  private descriptions: { title: string; description: string }[] = [];

  setSelectedServices(services: string[]) {
    this.selectedServices = services;
  }

  getSelectedServices() {
    return this.selectedServices;
  }

  setDescriptions(descriptions: { title: string; description: string }[]) {
    this.descriptions = descriptions;
  }

  getDescriptions() {
    return this.descriptions;
  }

  prepareCleanerData(formData: any) {
    return {
      ...formData,
      services: this.selectedServices,
      descriptions: this.descriptions,
    };
  }
}
