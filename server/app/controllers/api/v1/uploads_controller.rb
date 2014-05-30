class Api::V1::UploadsController < ApplicationController
  def create
    upload = UploadServer::Upload.new(upload_params)

    if upload.valid?
      render json: upload, status: 201
    else
      render json: { errors: upload.errors }, status: 422
    end
  end

  private

  def upload_params
    params.require(:upload).permit(
      :file_name
    )
  end
end
