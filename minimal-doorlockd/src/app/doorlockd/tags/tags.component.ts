import { Component, OnInit } from '@angular/core';
import { iTag, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags: iTag[] = [];
  formTagNew: FormGroup;
  formTagEdit: FormGroup;

  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
    public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    this.doorlockdApiClient.getAll(iObjType.tags).subscribe((data: iTag[])=>{
      console.log(data);
      this.tags = data;
})

  }

  formDelete(item_id) {
    if(confirm('Do you really want to delete this Tag?')) {
      this.doorlockdApiClient.delete(iObjType.tags, item_id).subscribe(res => {
        console.log('deleted tag ' + item_id );
        this.ngOnInit();
      });

    }
  }


  openmodal(content) {
    // init new form object
    this.formTagNew = this.fb.group({
      hwid: [''],
      description: [''],
      is_disabled: [false],
    }) 
    
    // launch modal
    this.modalService.open(content);
  }

  submitTagNew() {
    this.doorlockdApiClient.create(iObjType.tags,this.formTagNew.value).subscribe(res => {
      console.log('created new tag');
      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();

    });
  }

  openmodalEdit(content, tag: iTag) {
    // init form
    this.formTagEdit = this.fb.group({
      // id: new FormControl({value: tag.id, disabled: true}),
      id: [tag.id],
      hwid: [tag.hwid],
      description: [tag.description],
      is_disabled: [tag.is_disabled],
      created_at: [tag.created_at],
      updated_at: [tag.updated_at],
    })
    
    // open modal
    const modalRef = this.modalService.open(content);
    
  }

  submitTagUpdate() {
    console.log("tag object:", this.formTagEdit.value);

    this.doorlockdApiClient.update(iObjType.tags,this.formTagEdit.value.id,this.formTagEdit.value).subscribe(res => {
      console.log('tag updated', this.formTagEdit.value.id);
      
      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();

    
    });  }

}
