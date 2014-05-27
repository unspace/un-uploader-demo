class Api::V1::ImagesController < ApplicationController
  def index
    render json: Image.newest.visible.page(params[:page])
  end

  def show
    render json: Image.find(params[:id])
  end
end
