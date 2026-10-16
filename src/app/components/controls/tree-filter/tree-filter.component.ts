import { Functions } from '@app/helper/functions';
import { escapeHtml } from '@app/helper/html-escape';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, Output, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Input } from '@angular/core';

interface TreeNode {
  name: string;
  description?: any;
  highlight?: [],
  children?: TreeNode[];
  hide?: boolean;
}
interface FlatNode {
  expandable: boolean;
  name: string;
  description?: any;
  highlight?: [],
  hide?: boolean;
  level: number;
}

@Component({
  selector: 'tree-filter',
  templateUrl: './tree-filter.component.html',
  styleUrls: ['./tree-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeFilterComponent implements OnInit, AfterViewInit {
  @Input() isFilterLine = true;
  @Input() noPadding = false;
  @Input() set defaultFilterValue(val: string) {
    if (!val) {
      return;
    }
    this.textFilterTree = val;
    this.onKeyUpFilterTree();
    // console.log('textFilterTree = val')
  }
  @Input() set jsonData(val: any) {
    if (!val) {
      return;
    }
    if (typeof val === 'string') {
      val = Functions.JSON_parse(val) || {};
    }
    const convertObjectToTreeData = (data: any): TreeNode[] => {
      return Object.entries(data).map(([key, value]: any): TreeNode => {
        if (typeof value !== 'object') {
          return {
            name: `${key}: ${value}`,
            description: key
          }
        }
        const o = convertObjectToTreeData(value);
        const _length = Object.keys(value).length;
        return {
          name: `${key}: <i style="color: #999;">[${_length}] ${JSON.stringify(value)}</i>`,
          description: key,
          children: o
        }
      })
    }
    this.data = convertObjectToTreeData(val);
  }
  @Input() set data(val: TreeNode[]) {
    if (!val) {
      return;
    }
    this.dataSource.data = val;
    this.dataIndex = [];
    // console.log('this.dataSource.data = val;')
    const pushToIndex = (i: any) => {
      i.forEach(({ name, description, children }: any) => {
        const o: any = { name, description: description || name };
        if (children) {
          o.children = (JSON.stringify(children) + '').replace(/[\W]+/g, ' ').toLowerCase();
        }
        this.dataIndex.push(o);
        if (children) {
          pushToIndex(children)
        }
      })

    }
    pushToIndex(val);
    setTimeout(() => {
      this.cdr.detectChanges();
      this.onKeyUpFilterTree();
      if (this.noPadding) {
        this.tree.treeControl.expandAll();
      }
    });
  }
  @Input() selectedHexArray: any[] = [];
  @Input() isFilter: boolean = true;
  @Input() fileIcon: boolean = false;

  @ViewChild('tree') tree: any;

  textFilterGrid = '';
  textFilterTree = '';
  dataIndex: any[] = [];
  private bufferFiltered: any[] = [];
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener as any);

  @Output() filter: EventEmitter<any> = new EventEmitter();
  @Output() clickRow: EventEmitter<any> = new EventEmitter();

  constructor(private cdr: ChangeDetectorRef) {
    this.dataSource.data = [{ name: 'Loading...' }];
  }
  public hasChild(_: number, node: FlatNode) {
    return node.expandable;
  }
  private _transformer(node: TreeNode, level: number) {
    return {
      expandable: !!node.children?.length,
      description: node.description,
      highlight: node.highlight,
      hide: node.hide,
      name: node.name,
      level: level,
    };
  }
  highlight(text: any, isRedial = false): string {
    const raw = text == null ? '' : String(text);
    if (this.textFilterTree === '') {
      return raw;
    }
    const filters = this.textFilterTree.split('||').filter((f) => f !== '');
    if (filters.length === 0) {
      return escapeHtml(raw);
    }

    type Segment = { kind: 'text'; value: string } | { kind: 'mark'; value: string; color: string };
    let segments: Segment[] = [{ kind: 'text', value: raw }];

    filters.forEach((filter, key) => {
      const markClass = isRedial
        ? `filter-hit-radial-${key % 6}`
        : `filter-hit-${key % 6}`;
      const next: Segment[] = [];
      for (const segment of segments) {
        if (segment.kind !== 'text') {
          next.push(segment);
          continue;
        }
        let remaining = segment.value;
        while (remaining.includes(filter)) {
          const index = remaining.indexOf(filter);
          if (index > 0) {
            next.push({ kind: 'text', value: remaining.slice(0, index) });
          }
          next.push({ kind: 'mark', value: filter, color: markClass });
          remaining = remaining.slice(index + filter.length);
        }
        if (remaining.length > 0) {
          next.push({ kind: 'text', value: remaining });
        }
      }
      segments = next;
    });

    return segments
      .map((segment) => {
        if (segment.kind === 'text') {
          return escapeHtml(segment.value);
        }
        return `<mark class="${segment.color}">${escapeHtml(segment.value)}</mark>`;
      })
      .join('');
  }
  isSelectedHexArray({ description }: any) {
    return this.selectedHexArray.map((i: any) => i.description).includes(description);
  }
  treeFilter({ description: d, name: n }: any) {
    if (this.textFilterTree === '') {
      return true;
    }

    return this.bufferFiltered.find(({ name, description }) =>
      d && d !== '' ? name + description === n + d : name === n);
  }

  filterGrid(details: any[]) {
    if (true || this.textFilterGrid === '') {
      return details;
    }
    /** code */
  }
  ngAfterViewInit() {
    if (this.noPadding || this.textFilterTree !== '') {
      this.tree.treeControl.expandAll();
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    })
  }
  ngOnInit() {
    this.cdr.detectChanges();
  }
  onKeyUpFilterTree() {
    const tc = this.tree?.treeControl || {};
    if (tc.expandAll && tc.collapseAll) {
      if (this.textFilterTree !== '') {
        tc.expandAll();
      } else {
        tc.collapseAll();
      }
    }
    // console.log('------------', this.bufferFiltered)
    const b = this.dataIndex.filter(i => !!Math.max(...this.textFilterTree.toLowerCase().split('||').map(f => {
      return (i.description + i.name + (i.children || '')).toLowerCase().includes(f)
    })));

    this.bufferFiltered = b;
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
  setFilterGrid(textFilter: any) {
    this.textFilterGrid = textFilter;
    this.filter.emit(textFilter);
    this.cdr.detectChanges();
  }
  onClickLine(data: any) {
    // console.log(data)
    this.clickRow.emit(data);
  }
}
