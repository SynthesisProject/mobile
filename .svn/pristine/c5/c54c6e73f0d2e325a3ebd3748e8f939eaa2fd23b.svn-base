'use strict';

var SyncSelection = () => {

	class SyncSelectionImpl{

		constructor(){
			this.tools = {};
		}

		/**
		* Selects all tools that have upload/download sizes for sync
		*/
		selectAll(){
			for(var tool in this.tools){
				this.tools[tool].downloadSelected = this.tools[tool].contentDownloadSize > 0;
				this.tools[tool].uploadSelected = this.tools[tool].contentUploadSize > 0;
			}
		}

		/**
		* Selects all the downloads
		*/
		selectAllDownloads(){
			for(var tool in this.tools){
				this.tools[tool].downloadSelected = this.tools[tool].contentDownloadSize > 0;
			}
		}

		/**
		* Selects all the uploads
		*/
		selectAllUploads(){
			for(var tool in this.tools){
				this.tools[tool].uploadSelected = this.tools[tool].contentUploadSize > 0;
			}
		}

		/**
		* Get the total download size for selected items
		*/
		getDownloadSize(){
			var size = 0;
			for(var tool in this.tools){
				if (this.tools[tool].downloadSelected){
					size += this.tools[tool].contentDownloadSize;
				}
			}
			return size;
		}

		/**
		* Get the total upload size for selected items
		*/
		getUploadSize(){
			var size = 0;
			for(var tool in this.tools){
				if (this.tools[tool].uploadSelected){
					size += this.tools[tool].contentUploadSize;
				}
			}
			return size;
		}

		/**
		* Gets the total size for the sync selection
		*/
		getTotal(){
			return this.getDownloadSize() + this.getUploadSize();
		}

		/**
		* Returns an array of tools that are syncable
		*/
		getSyncableToolsArray(){
			var syncables = [];
			for(var idx in this.tools){
				if (this.tools[idx].contentDownloadSize > 0 || this.tools[idx].contentUploadSize > 0){
					syncables.push(this.tools[idx]);
				}
			}
			return syncables;
		}

		/**
		* Gets an array of tools that are selected for download
		*/
		getDownloadArray(){
			var array = [];
			for(var idx in this.tools){
				if (this.tools[idx].downloadSelected){
					array.push(this.tools[idx]);
				}
			}
			return array;
		}

		/**
		* Gets an array of tools that are selected for upload
		*/
		getUploadArray(){
			var array = [];
			for(var idx in this.tools){
				if (this.tools[idx].uploadSelected){
					array.push(this.tools[idx]);
				}
			}
			return array;
		}

		/**
		* Gets an array of tools that are selected for upload
		*/
		newInstance(){
			return new SyncSelectionImpl();
		}


	}

	return new SyncSelectionImpl();
};

SyncSelection.$inject = [];
export default SyncSelection;
