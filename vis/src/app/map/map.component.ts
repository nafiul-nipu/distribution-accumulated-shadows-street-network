import { environment } from '../../environments/environment.prod';
import { DataService } from '../data.service';
import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import {Map, View} from 'ol';
import {Image as ImageLayer, Tile as TileLayer, Vector} from 'ol/layer';
import {transform} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {Fill, Stroke, Circle, Style} from 'ol/style';
import {interpolateBlues} from 'd3-scale-chromatic';
import {Draw, Select, Translate} from 'ol/interaction';
import GeometryType from 'ol/geom/GeometryType';
import {shiftKeyOnly, click, never} from 'ol/events/condition';
import OSM from 'ol/source/OSM';
import { scaleSequential } from 'd3-scale';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
 // chi-jun-21 = 360
 // chi-sep-22 = 540
 // chi-dec-21 = 720 
  map: any;
  coordinates: any;
  mousePosition: number[] = [0,0];
  values: any = {'Winter': null, 'Summer': null, 'Spring': null}

  select:any = null

  colorPalette: any = scaleSequential()
    .domain([0, 360])
    .interpolator(interpolateBlues)

  @Output() onValues = new EventEmitter<string>();
  
  constructor(private dataService: DataService) { }

  ngAfterViewInit(): void {

    let self = this
    //
    this.map = new Map({
      target: 'map',
      view: new View({
        center: transform([-87.6298, 41.8781], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15
      })
    })

    let mapLayer = new TileLayer({
      className: 'mapLayer',
      source: new OSM(),
      zIndex: 0,
      opacity: 0.8
    })

    let style = new Style({
      fill: new Fill({
        color: 'rgba(193,66,66,1)'
      }),
      stroke: new Stroke({
        width: 3,
      }),
    });

    let source = new VectorSource({
      url: environment.filesurl+'/network',
      format: new GeoJSON(),
    })

    let vectorLayer = new VectorLayer({
      className: 'vectorLayer',
      zIndex: 1,
      source: source,
      style: function (feature) {
        style.getStroke().setColor(self.colorPalette(feature.get('chi-jun-21')))
        return style;
      },
    });

    let drawSource = new VectorSource({
      // wrapX: false
      useSpatialIndex: false
    })

    let drawLayer = new VectorLayer({
      className: 'draw-layer',
      zIndex: 2,
      source:drawSource
    })

    let draw = new Draw({
      source: drawSource,
      type: GeometryType.POLYGON,
      // condition: platformModifierKeyOnly
    })

    

    this.map.addInteraction(draw)

    let selectStyle = new Style({
      fill: new Fill({
        color: 'rgb(229,178,178, 0.4)'
      }),
      stroke: new Stroke({
        color: '#FE0000',
        width: 2
      })
    })


    let select = new Select({
      style: selectStyle
    })

    self.map.addInteraction(select)

    let selectedFeatures = select.getFeatures();

    let translate = new Translate({
      features: selectedFeatures
    })

    self.map.addInteraction(translate)
    
    draw.on('drawstart', function(event){
      drawSource.clear()
      select.setActive(false)
      // selectedFeatures.clear(); 
    });

    draw.on('drawend', function(event){

      delaySelecteActivate();

      let polygon:any = event.feature.getGeometry()
      let features:any = vectorLayer.getSource().getFeatures()

      self.values.Winter = []
      self.values.Summer = []
      self.values.Spring = []
      for (var i = 0 ; i < features.length; i++){
        if(polygon.intersectsExtent( features[i].getGeometry().getExtent() )){
          // console.log(features[i].get('chi-dec-21'), features[i].get('chi-jun-21'),features[i].get('chi-sep-22'))
          self.values.Winter.push(features[i].get('chi-dec-21'))
          self.values.Summer.push(features[i].get('chi-jun-21'))
          self.values.Spring.push(features[i].get('chi-sep-22'))
        }
      }
      
      self.updateValues()

      
    }); 
    
    translate.on('translateend', function(event){
      // console.log(event.features.getArray()[0].getGeometry())
      // console.log(event.features.get)
      self.values.Winter = []
      self.values.Summer = []
      self.values.Spring = []

      let polygon:any = event.features.getArray()[0].getGeometry()
      let features:any = vectorLayer.getSource().getFeatures()

      for (var i = 0 ; i < features.length; i++){
        if(polygon.intersectsExtent( features[i].getGeometry().getExtent() )){
          // console.log(features[i].get('chi-dec-21'), features[i].get('chi-jun-21'),features[i].get('chi-sep-22'))
          self.values.Winter.push(features[i].get('chi-dec-21'))
          self.values.Summer.push(features[i].get('chi-jun-21'))
          self.values.Spring.push(features[i].get('chi-sep-22'))
        }
      }
      self.updateValues()
    })


    

    this.map.addLayer(mapLayer)
    this.map.addLayer(vectorLayer)
    this.map.addLayer(drawLayer)   

   function delaySelecteActivate(){
      setTimeout(function(){ 
        //  console.log('hello from set timeout')
         select.setActive(true); 
        });
   }
    
    

  }

  

  async updateValues() {
    //
    if(this.values.Winter.length === 0){
      this.onValues.emit(undefined)
    }else{
      // console.log([this.values.Winter, this.values.Summer, this.values.Spring])
      this.dataService.getDistribution([this.values.Winter, this.values.Summer, this.values.Spring])
        .subscribe(data =>{
          // console.log(data)
          this.onValues.emit(data)
        })
    }    
  }
}
