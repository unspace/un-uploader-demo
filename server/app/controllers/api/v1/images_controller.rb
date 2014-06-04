class Api::V1::ImagesController < ApplicationController
  def index
    render json: Image.newest.processed.page(params[:page])
  end

  def show
    render json: Image.find(params[:id])
  end

  def create
    image = Image.create(image_params)

    if image.valid?
      ImageWorker.perform_async(image.id)
    end

    respond_with :api, :v1, image
  end

  private

  def image_params
    params.require(:image).permit(
      :upload_key
    )
  end
end
